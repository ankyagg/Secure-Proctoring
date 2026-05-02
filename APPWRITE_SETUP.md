# Appwrite Database Setup Guide

To ensure the Secure Proctor platform works correctly, you need to create the following collections in your Appwrite Database (`69ec8871002bec20d3fc`).

## 1. Environment Variables (.env)

Ensure your `.env` file contains these keys. Replace the values with your actual Appwrite console data if they differ.

```env
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=69ec85ee00105396979f
VITE_APPWRITE_DB_ID=69ec8871002bec20d3fc
VITE_APPWRITE_STORAGE_ID=69ec88dc0031491953ae
# Add your API Key for server-side operations if needed
VITE_APPWRITE_API_KEY=your_api_key_here
```

---

## 2. Collections Schema

Create the following 4 collections. Set the **Permissions** to `Any` (Read) and `Users` (Create/Update/Delete) or as per your security requirements.

### A. `questions`
| Attribute | Type | Size | Required | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `title` | String | 255 | Yes | |
| `description` | String | 5000 | Yes | |
| `difficulty` | String | 20 | Yes | Easy, Medium, Hard |
| `category` | String | 50 | Yes | Logic, Coding, etc. |
| `boilerplates` | String | 5000 | No | JSON string of starter code |
| `testCases` | String | 5000 | No | JSON string of test cases |

### B. `contests`
| Attribute | Type | Size | Required | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `name` | String | 255 | Yes | |
| `description` | String | 1000 | No | |
| `start_time` | String | 50 | Yes | ISO Date String |
| `end_time` | String | 50 | Yes | ISO Date String |
| `question_ids` | String | 2000 | No | JSON array of IDs |
| `anti_cheat` | String | 2000 | No | JSON object of settings |
| `problems` | Integer | - | No | Count of questions |

### C. `submissions`
| Attribute | Type | Size | Required | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `user_email` | String | 255 | Yes | |
| `question_id` | String | 50 | Yes | |
| `question_title`| String | 255 | Yes | |
| `source_code` | String | 10000 | Yes | |
| `language_id` | Integer | - | Yes | Judge0 ID |
| `passed_all` | Boolean | - | Yes | |
| `results` | String | 5000 | No | JSON string of test results |

### D. `proctor_logs` (Anti-Cheat Logs)
| Attribute | Type | Size | Required | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `user_id` | String | 50 | Yes | |
| `user_email` | String | 255 | Yes | |
| `user_name` | String | 255 | Yes | |
| `contest_id` | String | 50 | Yes | |
| `type` | String | 50 | Yes | Tab Switched, Gaze Away, etc. |
| `message` | String | 500 | Yes | |
| `screenshot_url` | String | 5000 | No | Data URL or Storage Link |
| `code_snapshot` | String | 10000 | No | Code at time of violation |
| `timestamp` | String | 50 | Yes | ISO Date String |

---

## 3. Storage
Ensure you have a Bucket with ID `69ec88dc0031491953ae` if you plan to upload actual files (currently screenshots are stored as strings in logs for simplicity).

## 4. Troubleshooting Visibility
If contests are not appearing in the Admin panel:
1. Double check the `VITE_APPWRITE_DB_ID` matches your database.
2. Ensure the collection ID is exactly `contests`.
3. Check the **Permissions** tab in Appwrite console — ensure the `Admin` user or `Any` has "Read" access.
