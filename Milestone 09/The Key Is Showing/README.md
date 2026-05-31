# NoteSnap

NoteSnap is a simple study-note summarisation tool that uses AI to condense your notes into key concepts.

## Live Deployment
- **URL**: [NoteSnap Production URL](https://notesnap.render.com) (Mock Deployment)

## Setup Instructions

Follow these steps to get the project running locally:

### 1. Root and Frontend Dependencies
Run this in the root folder to install Vite and React dependencies:
```bash
npm install
```

### 2. Backend Dependencies
Navigate to the `backend/` folder and install Express dependencies:
```bash
cd backend
npm install
```

### 3. Environment Variable
Create a `.env` file in the `backend/` directory and add your OpenAI API key:
```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

### 4. Run the Application
From the root directory, start the dev environment:
```bash
npm run dev
```

The app should now be running on [http://localhost:5173](http://localhost:5173).
