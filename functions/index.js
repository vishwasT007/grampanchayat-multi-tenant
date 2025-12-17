/**
 * Cloud Functions for 100% GP Automation
 */

const {onDocumentDeleted, onDocumentCreated} = require("firebase-functions/v2/firestore");
const {onCall} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const {defineString} = require("firebase-functions/params");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const {Octokit} = require("@octokit/rest");

admin.initializeApp();
setGlobalOptions({maxInstances: 10});

const githubToken = defineString("GITHUB_TOKEN");
const GITHUB_OWNER = "vishwasT007";
const GITHUB_REPO = "grampanchayat-multi-tenant";

exports.onGPDeleted = onDocumentDeleted(
    "globalConfig/metadata/gramPanchayats/{gpId}",
    async (event) => {
      const gpId = event.params.gpId;
      const gpData = event.data.data();
      logger.info(`🗑️ GP Deleted: ${gpId}`, {gpData});

      try {
        if (gpData.domain) {
          const subdomain = gpData.domain.replace(".web.app", "").replace(".firebaseapp.com", "");
          try {
            logger.info(`🌐 Deleting hosting site: ${subdomain}`);
            const accessToken = await admin.credential.applicationDefault().getAccessToken();
            const response = await fetch(
                `https://firebasehosting.googleapis.com/v1beta1/sites/${subdomain}`,
                {
                  method: "DELETE",
                  headers: {
                    "Authorization": `Bearer ${accessToken.access_token}`,
                    "Content-Type": "application/json",
                  },
                },
            );
            if (response.ok) {
              logger.info(`✅ Hosting site deleted: ${subdomain}`);
            } else {
              const error = await response.text();
              logger.error(`❌ Failed to delete hosting site: ${error}`);
            }
          } catch (hostingError) {
            logger.error("❌ Hosting site deletion error:", hostingError);
          }
        }

        try {
          logger.info(`👤 Deleting Auth users for GP: ${gpId}`);
          const usersSnapshot = await admin.firestore().collection(`gramPanchayats/${gpId}/users`).get();
          const deletePromises = [];
          for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            const uid = userDoc.id;
            logger.info(`👤 Deleting Auth user: ${userData.email} (${uid})`);
            deletePromises.push(
                admin.auth().deleteUser(uid)
                    .then(() => logger.info(`✅ Deleted Auth user: ${uid}`))
                    .catch((err) => logger.error(`❌ Failed to delete Auth user ${uid}:`, err)),
            );
          }
          await Promise.all(deletePromises);
          logger.info(`✅ Deleted ${deletePromises.length} Auth users`);
        } catch (authError) {
          logger.error("❌ Auth user deletion error:", authError);
        }

        logger.info(`✅ GP deletion complete: ${gpId}`);
        return {success: true, gpId};
      } catch (error) {
        logger.error(`❌ GP deletion failed: ${gpId}`, error);
        throw error;
      }
    },
);

exports.onGPCreated = onDocumentCreated(
    "globalConfig/metadata/gramPanchayats/{gpId}",
    async (event) => {
      const gpId = event.params.gpId;
      const gpData = event.data.data();
      logger.info(`🚀 New GP Created: ${gpId}`, {gpData});

      try {
        const token = githubToken.value();
        if (!token) {
          logger.error("❌ GitHub token not configured");
          return {success: false, error: "GitHub token not configured"};
        }

        let subdomain = gpData.subdomain || gpData.domain?.replace(".web.app", "").replace(".firebaseapp.com", "");
        if (!subdomain) {
          logger.error("❌ No subdomain configured for GP");
          return {success: false, error: "No subdomain configured"};
        }

        // Make subdomain globally unique by using the project-specific subdomain
        // Firebase hosting sites must be unique across ALL projects
        const projectId = process.env.GCLOUD_PROJECT;
        const uniqueSubdomain = subdomain; // Already should have suffix from form

        // STEP 1: Create Firebase Hosting Site
        logger.info(`🌐 Creating Firebase hosting site: ${uniqueSubdomain}`);
        try {
          const accessToken = await admin.credential.applicationDefault().getAccessToken();
          
          const createSiteResponse = await fetch(
              `https://firebasehosting.googleapis.com/v1beta1/projects/${projectId}/sites?siteId=${uniqueSubdomain}`,
              {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${accessToken.access_token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: "DEFAULT_SITE",
                }),
              },
          );

          if (createSiteResponse.ok) {
            const siteData = await createSiteResponse.json();
            logger.info(`✅ Hosting site created: ${uniqueSubdomain}`, {siteData});
          } else if (createSiteResponse.status === 409) {
            // Site already exists, that's okay
            logger.info(`ℹ️ Hosting site already exists: ${uniqueSubdomain}`);
          } else {
            const error = await createSiteResponse.text();
            logger.warn(`⚠️ Could not create hosting site (Status ${createSiteResponse.status}): ${error}`);
            // Continue anyway, maybe it exists
          }
        } catch (hostingError) {
          logger.warn("⚠️ Hosting site creation error (continuing anyway):", hostingError);
          // Don't fail the whole process if site creation fails
        }
        
        // Use the unique subdomain for deployment
        subdomain = uniqueSubdomain;

        // STEP 2: Trigger GitHub Actions Deployment
        logger.info(`📡 Triggering GitHub Actions deployment for: ${subdomain}`);
        const octokit = new Octokit({auth: token});
        const response = await octokit.actions.createWorkflowDispatch({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          workflow_id: "deploy-gp.yml",
          ref: "main",
          inputs: {gp_subdomain: subdomain},
        });

        logger.info(`✅ GitHub Actions triggered for: ${subdomain}`, {status: response.status});
        await event.data.ref.update({
          deploymentStatus: "deploying",
          deploymentTriggeredAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {success: true, gpId, subdomain, deploymentTriggered: true};
      } catch (error) {
        logger.error(`❌ Auto-deployment failed for: ${gpId}`, error);
        await event.data.ref.update({
          deploymentStatus: "failed",
          deploymentError: error.message,
          deploymentFailedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        throw error;
      }
    },
);

exports.getDeploymentStatus = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("Must be authenticated");
  }
  const {gpId} = request.data;
  try {
    const gpDoc = await admin.firestore().doc(`globalConfig/metadata/gramPanchayats/${gpId}`).get();
    if (!gpDoc.exists) {
      throw new Error("GP not found");
    }
    const gpData = gpDoc.data();
    return {
      gpId,
      deploymentStatus: gpData.deploymentStatus || "unknown",
      deploymentTriggeredAt: gpData.deploymentTriggeredAt,
      deploymentError: gpData.deploymentError,
    };
  } catch (error) {
    logger.error("Error getting deployment status:", error);
    throw error;
  }
});
