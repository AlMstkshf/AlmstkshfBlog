
import { storage } from "./storage";

async function updateArticle95() {
  try {
    console.log("Updating article 95 to replace 'مراقبة الإعلام' with 'الرصد الإعلامي'...");
    
    const updatedArticle = await storage.updateArticleText(
      95, 
      "مراقبة الإعلام", 
      "الرصد الإعلامي"
    );
    
    console.log("Article 95 updated successfully!");
    console.log("Updated fields:");
    console.log("- Title (Arabic):", updatedArticle.titleAr);
    console.log("- Excerpt (Arabic):", updatedArticle.excerptAr?.substring(0, 100) + "...");
    console.log("- Content updated at:", updatedArticle.updatedAt);
    
  } catch (error) {
    console.error("Error updating article 95:", error);
    process.exit(1);
  }
}

// Run the update
updateArticle95()
  .then(() => {
    console.log("Update completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to update article 95:", error);
    process.exit(1);
  });
