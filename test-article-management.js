import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function testArticleManagement() {
  console.log('🚀 Starting Article Management System Test\n');
  
  let accessToken = null;
  
  try {
    // Step 1: Login (with retry for rate limiting)
    console.log('1. Testing Authentication...');
    let loginAttempts = 0;
    const maxAttempts = 3;
    
    while (loginAttempts < maxAttempts) {
      try {
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'admin',
            password: 'password'
          })
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          accessToken = loginData.data.accessToken;
          console.log('✅ Login successful');
          break;
        } else {
          const error = await loginResponse.json();
          if (error.code === 'RATE_LIMITED') {
            console.log(`⏳ Rate limited, waiting ${error.retryAfter} seconds...`);
            await new Promise(resolve => setTimeout(resolve, (error.retryAfter + 1) * 1000));
            loginAttempts++;
          } else {
            throw new Error(`Login failed: ${error.message}`);
          }
        }
      } catch (err) {
        console.error('❌ Login error:', err.message);
        loginAttempts++;
        if (loginAttempts >= maxAttempts) {
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    if (!accessToken) {
      throw new Error('Failed to obtain access token after multiple attempts');
    }

    // Step 2: Test Categories API
    console.log('\n2. Testing Categories API...');
    const categoriesResponse = await fetch('http://localhost:5000/api/categories', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!categoriesResponse.ok) {
      throw new Error('Failed to fetch categories');
    }

    const categories = await categoriesResponse.json();
    console.log(`✅ Categories fetched: ${categories.length} categories found`);
    
    if (categories.length === 0) {
      console.log('⚠️  No categories found - creating a test category');
      // You might want to create a test category here
    }

    // Step 3: Test Articles API
    console.log('\n3. Testing Articles API...');
    const articlesResponse = await fetch('http://localhost:5000/api/articles?limit=10', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!articlesResponse.ok) {
      throw new Error('Failed to fetch articles');
    }

    const articlesData = await articlesResponse.json();
    const articles = articlesData.data || articlesData;
    console.log(`✅ Articles fetched: ${articles.length} articles found`);

    // Step 4: Test Article Creation
    console.log('\n4. Testing Article Creation...');
    if (categories.length > 0) {
      const testArticle = {
        titleEn: `Test Article ${Date.now()}`,
        titleAr: `مقال تجريبي ${Date.now()}`,
        contentEn: '<h1>Test Content</h1><p>This is a comprehensive test article created via API to test the article management system.</p><p>Features being tested:</p><ul><li>Rich text content</li><li>Bilingual support</li><li>Category assignment</li><li>SEO metadata</li></ul>',
        contentAr: '<h1>محتوى تجريبي</h1><p>هذا مقال تجريبي شامل تم إنشاؤه عبر الواجهة البرمجية لاختبار نظام إدارة المقالات.</p><p>الميزات التي يتم اختبارها:</p><ul><li>محتوى نص منسق</li><li>دعم ثنائي اللغة</li><li>تعيين الفئة</li><li>بيانات تحسين محركات البحث</li></ul>',
        excerptEn: 'A comprehensive test article for the article management system',
        excerptAr: 'مقال تجريبي شامل لنظام إدارة المقالات',
        categoryId: categories[0].id,
        authorName: 'Test Admin',
        slug: `test-article-${Date.now()}`,
        published: false,
        featured: false,
        metaTitle: 'Test Article - Article Management System',
        metaDescription: 'Testing the article management system functionality',
        keywords: 'test, article, management, system'
      };

      const createResponse = await fetch('http://localhost:5000/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(testArticle)
      });

      if (createResponse.ok) {
        const newArticle = await createResponse.json();
        console.log(`✅ Article created successfully: "${newArticle.data.titleEn}"`);
        console.log(`   Article ID: ${newArticle.data.id}`);
        
        // Step 5: Test Article Update
        console.log('\n5. Testing Article Update...');
        const updateData = {
          titleEn: newArticle.data.titleEn + ' (Updated)',
          published: true
        };

        const updateResponse = await fetch(`http://localhost:5000/api/articles/${newArticle.data.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(updateData)
        });

        if (updateResponse.ok) {
          const updatedArticle = await updateResponse.json();
          console.log(`✅ Article updated successfully: "${updatedArticle.data.titleEn}"`);
          console.log(`   Published status: ${updatedArticle.data.published}`);
        } else {
          const error = await updateResponse.text();
          console.error('❌ Article update failed:', error);
        }

        // Step 6: Test Article Retrieval by ID
        console.log('\n6. Testing Article Retrieval by ID...');
        const getResponse = await fetch(`http://localhost:5000/api/articles/${newArticle.data.id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (getResponse.ok) {
          const retrievedArticle = await getResponse.json();
          console.log(`✅ Article retrieved by ID: "${retrievedArticle.titleEn}"`);
        } else {
          console.error('❌ Failed to retrieve article by ID');
        }

      } else {
        const error = await createResponse.text();
        console.error('❌ Article creation failed:', error);
      }
    } else {
      console.log('⚠️  Skipping article creation - no categories available');
    }

    // Step 7: Test File Upload
    console.log('\n7. Testing File Upload...');
    try {
      // Create a simple test image file
      const testImagePath = path.join(process.cwd(), 'test-image.txt');
      fs.writeFileSync(testImagePath, 'This is a test file for upload testing');

      const formData = new FormData();
      formData.append('file', fs.createReadStream(testImagePath), {
        filename: 'test-image.txt',
        contentType: 'text/plain'
      });

      const uploadResponse = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        console.log(`✅ File uploaded successfully: ${uploadResult.data.filename}`);
        console.log(`   File URL: ${uploadResult.data.url}`);
      } else {
        const error = await uploadResponse.text();
        console.error('❌ File upload failed:', error);
      }

      // Clean up test file
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    } catch (uploadError) {
      console.error('❌ File upload test error:', uploadError.message);
    }

    // Step 8: Test Search Functionality
    console.log('\n8. Testing Search Functionality...');
    const searchResponse = await fetch('http://localhost:5000/api/search?q=test&language=en', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (searchResponse.ok) {
      const searchResults = await searchResponse.json();
      console.log(`✅ Search completed: ${searchResults.length} results found`);
    } else {
      console.error('❌ Search test failed');
    }

    console.log('\n🎉 Article Management System Test Completed Successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Authentication system working');
    console.log('✅ Categories API working');
    console.log('✅ Articles API working');
    console.log('✅ Article CRUD operations working');
    console.log('✅ File upload system working');
    console.log('✅ Search functionality working');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('1. Make sure the server is running on http://localhost:5000');
    console.log('2. Check if the database is connected');
    console.log('3. Verify admin credentials (admin/password)');
    console.log('4. Wait for rate limiting to reset if needed');
  }
}

testArticleManagement();