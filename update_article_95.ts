
import { storage } from "./server/storage";

async function updateArticle95() {
  try {
    // Get the current article
    const article = await storage.getArticleById(95);
    
    if (!article) {
      console.error("Article with ID 95 not found");
      return;
    }

    console.log("Current article found:", article.titleAr);

    // Prepare the updates with terminology changes
    const updates: any = {};

    // Update Arabic title
    if (article.titleAr) {
      updates.titleAr = article.titleAr.replace(/مراقبة الإعلام/g, "الرصد الإعلامي");
    }

    // Update Arabic excerpt
    if (article.excerptAr) {
      updates.excerptAr = article.excerptAr.replace(/مراقبة الإعلام/g, "الرصد الإعلامي");
    }

    // Update Arabic content
    if (article.contentAr) {
      updates.contentAr = article.contentAr.replace(/مراقبة الإعلام/g, "الرصد الإعلامي");
    }

    // Perform the update
    const updatedArticle = await storage.updateArticle(95, updates);

    console.log("Article updated successfully!");
    console.log("New Arabic title:", updatedArticle.titleAr);
    
    // Verify the changes
    const verifyArticle = await storage.getArticleById(95);
    if (verifyArticle) {
      console.log("\nVerification:");
      console.log("Title contains old term:", verifyArticle.titleAr?.includes("مراقبة الإعلام") || false);
      console.log("Title contains new term:", verifyArticle.titleAr?.includes("الرصد الإعلامي") || false);
      
      if (verifyArticle.excerptAr) {
        console.log("Excerpt contains old term:", verifyArticle.excerptAr.includes("مراقبة الإعلام"));
        console.log("Excerpt contains new term:", verifyArticle.excerptAr.includes("الرصد الإعلامي"));
      }
      
      if (verifyArticle.contentAr) {
        console.log("Content contains old term:", verifyArticle.contentAr.includes("مراقبة الإعلام"));
        console.log("Content contains new term:", verifyArticle.contentAr.includes("الرصد الإعلامي"));
      }
    }

  } catch (error) {
    console.error("Error updating article:", error);
  }
}

// Run the update
updateArticle95().then(() => {
  console.log("Update process completed");
  process.exit(0);
}).catch((error) => {
  console.error("Update process failed:", error);
  process.exit(1);
});
