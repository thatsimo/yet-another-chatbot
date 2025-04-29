# Yet Another Chatbot

## Project Description

Yet Another Chatbot is a web application designed to manage chat sessions based on documents uploaded by users. It leverages technologies such as Pinecone for document indexing and retrieval, langchain (RAG) and OpenAI for generating intelligent responses.

## Installation and Configuration

### Prerequisites

- Node.js (version 18 or higher)
- Python (version 3.9 or higher)
- pip
- pnpm (package manager for Node.js)

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/thatsimo/yet-another-chatbot.git
   cd yet-another-chatbot
   ```

2. Configure environment variables:
   Create a `.env` file in the `worker/` directory and add the following variables:

   ```env
   PINECONE_API_KEY=<your Pinecone API Key>
   PINECONE_INDEX=<Pinecone index name>
   PINECONE_NAMESPACE=<namespace prefix>
   EMBEDDING_MODEL=<OpenAI embedding model, e.g., "text-embedding-ada-002">
   OPENAI_API_KEY=<your OpenAI API Key>
   DATABASE_URL=sqlite:///./sessions.db
   ```

   Create a `.env` file in the `webapp/` directory and add the following variables:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. Install backend dependencies:

   ```bash
   cd worker
   pip install -r requirements.txt
   ```

4. Install frontend dependencies:

   ```bash
   cd webapp
   pnpm install
   ```

## Running the Project

### Starting the Frontend

1. Navigate to the `webapp` directory:
   ```bash
   cd webapp
   ```
2. Start the development server:
   ```bash
   pnpm dev
   ```
3. Access the application at `http://localhost:3000`.

### Starting the Backend

1. Navigate to the `worker` directory:
   ```bash
   cd worker
   ```
2. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
3. The backend will be available at `http://localhost:8000`.

## Technical Details

### Libraries and Tools Used

#### Frontend

- **Next.js**: React framework for web applications.
- **Tailwind CSS**: CSS framework for rapid and customizable styling.
- **Radix UI**: Accessible and modular UI components.
- **React Query**: Asynchronous state management.

#### Backend

- **FastAPI**: Python framework for fast and performant APIs.
- **Pinecone**: Service for vector indexing and retrieval.
- **LangChain**: Tools for managing LLM (Large Language Models) chains.

#### Other Tools

- **Prettier**: Code formatting.
- **pnpm**: Package manager for Node.js.

### Template and Structure

- The project uses a modular structure with separate folders for the frontend (`webapp`) and backend (`worker`).
- UI components are organized in the `webapp/components/ui` directory for easy reusability.
- The backend is designed to handle chat sessions and upload documents to Pinecone for contextual retrieval.

For more information, refer to the code documentation or contact the development team.

## License

Do not use this code for any commercial purposes. This project is for educational purposes only and is not intended for production use.
