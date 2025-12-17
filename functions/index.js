/**
 * Cloud Functions for 100% GP Automation
 * 
 * Features:
 * 1. Auto-delete hosting sites when GP is deleted
 * 2. Auto-delete Auth users when GP is deleted
 * 3. Auto-trigger GitHub Actions deployment when GP is created
 * 4. Auto-update firebase.json configuration
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const { Octokit } = require("@octokit/rest");

admin.initializeApp();

// GitHub configuration
const GITHUB_TOKEN = functions.config().github?.token;
const GITHUB_OWNER = "vishwasT007";
const GITHUB_REPO = "grampanchayat-multi-tenant";

/**
 * 🗑️ AUTO-DELETE HOSTING SITE & AUTH USERS
 * Triggers when a GP is deleted from Firestore
 */
exports.onGPDeleted = functions.firestore
  .document("globalConfig/metadata/gramPanchayats/{gpId}")
  .onDelete(async (snapshot, context) => {
    const gpId = context.params.gpId;
    const gpData = snapshot.data();
    
    logger.info(`🗑️ GP Deleted: ${gpId}`, { gpData });

    try {
      // 1. Delete Firebase Hosting Site
      if (gpData.domain) {
        const subdomain = gpData.domain.replace(".web.app", "").replace(".firebaseapp.com", "");
        
        try {
          logger.info(`🌐 Deleting hosting site: ${subdomain}`);
          
          // Note: Firebase Admin SDK doesn't have direct hosting API
          // We'll use HTTP API with service account credentials
          const projectId = process.env.GCLOUD_PROJECT;
          const accessToken = await admin.credential.applicationDefault().getAccessToken();
          
          const response = await fetch(
            `https://firebasehosting.googleapis.com/v1beta1/sites/${subdomain}`,
            {
              method: "DELETE",
              headers: {
                "Authorization": `Bearer ${accessToken.access_token}`,
                "Content-Type": "application/json",
              },
            }
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

      // 2. Delete all Firebase Auth users for this GP
      try {
        logger.info(`👤 Deleting Auth users for GP: ${gpId}`);
        
        // Get all users from Firestore
        const usersSnapshot = await admin.firestore()
          .collection(`gramPanchayats/${gpId}/users`)
          .get();

        const deletePromises = [];
        
        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          const uid = userDoc.id;
          
          logger.info(`👤 Deleting Auth user: ${userData.email} (${uid})`);
          
          // Delete from Firebase Auth
          deletePromises.push(
            admin.auth().deleteUser(uid)
              .then(() => logger.info(`✅ Deleted Auth user: ${uid}`))
              .catch((err) => logger.error(`❌ Failed to delete Auth user ${uid}:`, err))
          );
        }

        await Promise.all(deletePromises);
        logger.info(`✅ Deleted ${deletePromises.length} Auth users`);
      } catch (authError) {
        logger.error("❌ Auth user deletion error:", authError);
      }

      // 3. Update firebase.json configuration via GitHub API
      try {
        if (!GITHUB_TOKEN) {
          logger.warn("⚠️ GitHub token not configured, skipping firebase.json update");
        } else {
          logger.info("📝 Updating firebase.json via GitHub API");
          await updateFirebaseConfig(gpId, gpData, "delete");
        }
      } catch (configError) {
        logger.error("❌ Configuration update error:", configError);
      }

      logger.info(`✅ GP deletion complete: ${gpId}`);
      return { success: true, gpId };
      
    } catch (error) {
      logger.error(`❌ GP deletion failed: ${gpId}`, error);
      throw error;
    }
  });

/**
 * 🚀 AUTO-DEPLOY NEW GP
 * Triggers when a new GP is created in Firestore
 */
exports.onGPCreated = functions.firestore
  .document("globalConfig/metadata/gramPanchayats/{gpId}")
  .onCreate(async (snapshot, context) => {
    const gpId = context.params.gpId;
    const gpData = snapshot.data();
    
    logger.info(`🚀 New GP Created: ${gpId}`, { gpData });

    try {
      if (!GITHUB_TOKEN) {
        logger.error("❌ GitHub token not configured. Set with: firebase functions:config:set github.token=YOUR_TOKEN");
        return { success: false, error: "GitHub token not configured" };
      }

      const subdomain = gpData.domain?.replace(".web.app", "").replace(".firebaseapp.com", "");
      
      if (!subdomain) {
        logger.error("❌ No domain configured for GP");
        return { success: false, error: "No domain configured" };
      }

      logger.info(`📡 Triggering GitHub Actions deployment for: ${subdomain}`);

      // Trigger GitHub Actions workflow
      const octokit = new Octokit({ auth: GITHUB_TOKEN });
      
      const response = await octokit.actions.createWorkflowDispatch({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        workflow_id: "deploy-gp.yml",
        ref: "main",
        inputs: {
          gp_subdomain: subdomain,
        },
      });

      logger.info(`✅ GitHub Actions triggered for: ${subdomain}`, { status: response.status });
      
      // Update GP metadata with deployment status
      await snapshot.ref.update({
        deploymentStatus: "deploying",
        deploymentTriggeredAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, gpId, subdomain, deploymentTriggered: true };
      
    } catch (error) {
      logger.error(`❌ Auto-deployment failed for: ${gpId}`, error);
      
      // Update GP metadata with error status
      await snapshot.ref.update({
        deploymentStatus: "failed",
        deploymentError: error.message,
        deploymentFailedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      throw error;
    }
  });

/**
 * 📝 UPDATE FIREBASE CONFIG (Helper Function)
 * Updates firebase.json and .firebaserc via GitHub API
 */
async function updateFirebaseConfig(gpId, gpData, action) {
  const octokit = new Octokit({ auth: GITHUB_TOKEN });
  const subdomain = gpData.domain?.replace(".web.app", "").replace(".firebaseapp.com", "");
  
  if (!subdomain) return;

  try {
    // Get current firebase.json
    const { data: firebaseJsonFile } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: "firebase.json",
    });

    const firebaseJsonContent = Buffer.from(firebaseJsonFile.content, "base64").toString();
    const firebaseJson = JSON.parse(firebaseJsonContent);

    // Get current .firebaserc
    const { data: firebasercFile } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: ".firebaserc",
    });

    const firebasercContent = Buffer.from(firebasercFile.content, "base64").toString();
    const firebaserc = JSON.parse(firebasercContent);

    if (action === "delete") {
      // Remove from firebase.json
      firebaseJson.hosting = firebaseJson.hosting.filter(
        (site) => site.target !== subdomain && site.target !== gpId
      );

      // Remove from .firebaserc
      if (firebaserc.targets?.grampanchayat-multi-tenant) {
        delete firebaserc.targets["grampanchayat-multi-tenant"][subdomain];
        delete firebaserc.targets["grampanchayat-multi-tenant"][gpId];
      }
    }

    // Update firebase.json
    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: "firebase.json",
      message: `chore: ${action === "delete" ? "Remove" : "Update"} ${subdomain} hosting configuration`,
      content: Buffer.from(JSON.stringify(firebaseJson, null, 2)).toString("base64"),
      sha: firebaseJsonFile.sha,
    });

    logger.info("✅ firebase.json updated via GitHub API");

    // Update .firebaserc
    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: ".firebaserc",
      message: `chore: ${action === "delete" ? "Remove" : "Update"} ${subdomain} hosting target`,
      content: Buffer.from(JSON.stringify(firebaserc, null, 2)).toString("base64"),
      sha: firebasercFile.sha,
    });

    logger.info("✅ .firebaserc updated via GitHub API");
    
  } catch (error) {
    logger.error("❌ Failed to update configuration files:", error);
    throw error;
  }
}

/**
 * 📊 GET DEPLOYMENT STATUS (Callable Function)
 * Allows Super Admin to check deployment status
 */
exports.getDeploymentStatus = functions.https.onCall(async (data, context) => {
  // Verify Super Admin authentication
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
  }

  const { gpId } = data;
  
  try {
    const gpDoc = await admin.firestore()
      .doc(`globalConfig/metadata/gramPanchayats/${gpId}`)
      .get();
      
    if (!gpDoc.exists) {
      throw new functions.https.HttpsError("not-found", "GP not found");
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
    throw new functions.https.HttpsError("internal", error.message);
  }
});
