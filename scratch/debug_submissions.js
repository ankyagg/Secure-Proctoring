import { Client, Databases, Query } from "node-appwrite";

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('69ec85ee00105396979f')
    .setKey('standard_d9c41ad7d83d60fd108a1942ea85cf2da8db557642aa4112f231dd9b7f9c8cfd009781ca8f6baa226d2d47c806453c2ee6432fc5b8825858cb0756904fcbf36acf7107a30fede68d3503bea8aa341d0834654a2dcd6db9f259980fcbec1fcc202d2850e5d6c8118f60794893872f93f8710d6e9c2be55b8c6d8cfcfdc4a26dac');

const databases = new Databases(client);

async function debugSubmissions() {
    try {
        const email = "ixaaniketwalanj@gmail.com"; 
        console.log(`Fetching submissions for: ${email}`);
        
        const response = await databases.listDocuments('69ec8871002bec20d3fc', 'submissions', [
            Query.equal('user_email', email)
        ]);
        
        console.log("Total Submissions Found:", response.total);
        response.documents.forEach(doc => {
            console.log(`- ID: ${doc.$id}, Question: ${doc.question_id}, Contest: ${doc.contest_id}, Passed: ${doc.passed_all}`);
        });
    } catch (err) {
        console.error("Error:", err);
    }
}

debugSubmissions();
