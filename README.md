# Prompt Editor

A powerful web application for breaking down, editing, and optimizing large AI prompts with AI assistance.

## Features

- **AI-Powered Segmentation**: Break complex prompts into logical, manageable sections using OpenAI
- **Interactive Editing**: Edit each segment individually with a clean, intuitive interface
- **Drag & Drop Reordering**: Reorganize segments to optimize prompt flow and logic
- **AI Conciseness**: Use AI to make individual segments more concise while preserving meaning
- **Include/Exclude Toggle**: Control which segments are included in the final output
- **Real-time Preview**: See your final optimized prompt update in real-time
- **Session Persistence**: Your work is automatically saved and restored between sessions
- **Export Functionality**: Download your optimized prompt as a text file
- **Dark/Light Theme**: Choose between dark and light themes for comfortable editing
- **Privacy-First**: All data stays in your browser - nothing is stored on external servers

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd prompt-editor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Configuration

1. Click the settings gear icon in the top-right corner
2. Enter your OpenAI API key
3. Select your preferred model (GPT-4o-mini or GPT-3.5-turbo)
4. Your API key is stored securely in your browser's local storage

## How to Use

1. **Input Your Prompt**: Paste or type your large, complex prompt into the input area
2. **Break Into Segments**: Click "Break Into Sections" to let AI analyze and segment your prompt
3. **Edit Segments**:
   - Click on any segment to edit its content
   - Use the concise button to make segments shorter with AI assistance
   - Toggle segments on/off to include/exclude them from the final output
4. **Reorder**: Drag and drop segments to change their order in the final prompt
5. **Preview**: See your optimized prompt in the preview panel
6. **Export**: Download your final prompt as a text file

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: SCSS with CSS custom properties for theming
- **AI Integration**: OpenAI API (GPT-4o-mini, GPT-3.5-turbo)
- **Drag & Drop**: @dnd-kit
- **Icons**: FontAwesome
- **State Management**: React hooks with custom hook patterns

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/          # React components
│   ├── ApiKeyManager.tsx    # API key configuration
│   ├── PromptInput.tsx      # Main prompt input area
│   ├── SegmentsPanel.tsx    # Editable segments list
│   ├── PromptSegment.tsx    # Individual segment component
│   └── PreviewPanel.tsx     # Final output preview
├── hooks/               # Custom React hooks
│   └── usePromptEditor.ts   # Main application state logic
├── services/            # External services
│   └── openai.ts           # OpenAI API integration
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
└── App.tsx             # Main application component
```

## Privacy & Security

- **Local Storage Only**: All data is stored in your browser's local storage
- **No External Servers**: Your prompts and API keys never leave your browser
- **Secure API Handling**: API keys are stored locally and transmitted directly to OpenAI
- **Session Persistence**: Work is automatically saved and can be resumed later

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
