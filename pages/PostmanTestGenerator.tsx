
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useProject } from '../context/ProjectContext';

const PostmanTestGenerator: React.FC = () => {
    const { addToast } = useProject();
    const [jsonInput, setJsonInput] = useState('');
    const [variableParams, setVariableParams] = useState('');
    const [statusCode, setStatusCode] = useState('200');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!jsonInput.trim()) {
            setError('JSON input cannot be empty.');
            addToast('JSON input cannot be empty.', 'error');
            return;
        }
        try {
            JSON.parse(jsonInput);
        } catch (e) {
            setError('Invalid JSON provided.');
            addToast('Invalid JSON provided.', 'error');
            return;
        }
        if (!statusCode.trim() || isNaN(Number(statusCode))) {
            setError('Valid status code is required.');
            addToast('Valid status code is required.', 'error');
            return;
        }

        setIsLoading(true);
        setError('');
        setGeneratedCode('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `
Analyze the JSON and generate a JavaScript test script.
Use code: ${statusCode}.
Dynamics: ${variableParams}.
Output only code block.

JSON:
\`\`\`json
${jsonInput}
\`\`\`
`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
            });

            const textResult = response.text;
            const match = textResult.match(/```javascript\n([\s\S]*?)```/);
            
            if (match && match[1]) {
                setGeneratedCode(match[1].trim());
            } else {
                setGeneratedCode(textResult.trim());
            }

        } catch (err) {
            console.error(err);
            const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate test script: ${errorMessage}`);
            addToast(`Failed to generate test script: ${errorMessage}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setJsonInput('');
        setVariableParams('');
        setStatusCode('200');
        setGeneratedCode('');
        setError('');
    };

    const handleCopy = () => {
        if (!generatedCode) return;
        navigator.clipboard.writeText(generatedCode)
            .then(() => {
                addToast('Code copied to clipboard!', 'success');
            })
            .catch(err => {
                addToast('Failed to copy code.', 'error');
                console.error('Failed to copy: ', err);
            });
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-md space-y-6 border border-gray-100 dark:border-transparent transition-colors duration-300">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">JS Code Test Generator</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Paste a raw API JSON response, specify dynamic parameters, and generate robust JS test scripts instantly.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Column */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="json-input" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Raw API JSON Response</label>
                        <textarea
                            id="json-input"
                            rows={15}
                            className="w-full p-3 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500 font-mono text-xs text-gray-900 dark:text-white transition-colors"
                            placeholder='{ "id": 123, "name": "Test Item" ... }'
                            value={jsonInput}
                            onChange={e => setJsonInput(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="variable-params" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Dynamic Parameter Names</label>
                        <input
                            type="text"
                            id="variable-params"
                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white"
                            placeholder="e.g., id, createdAt"
                            value={variableParams}
                            onChange={e => setVariableParams(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="status-code" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Expected Status Code</label>
                        <input
                            type="number"
                            id="status-code"
                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white"
                            value={statusCode}
                            onChange={e => setStatusCode(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="flex-grow px-6 py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            {isLoading ? 'Generating...' : 'Generate JS Tests'}
                        </button>
                        <button
                            onClick={handleClear}
                            disabled={isLoading}
                            className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* Output Column */}
                <div className="space-y-4 flex flex-col">
                    <div className="flex justify-between items-center">
                        <label htmlFor="js-output" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Generated Script</label>
                        <button
                            onClick={handleCopy}
                            disabled={!generatedCode || isLoading}
                            className="px-4 py-2 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                        >
                            Copy Code
                        </button>
                    </div>
                    <div className="relative flex-grow">
                        <textarea
                            id="js-output"
                            readOnly
                            className="w-full h-full p-3 border rounded-md bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 font-mono text-xs text-purple-700 dark:text-purple-300 resize-none transition-colors"
                            placeholder="JavaScript code will appear here..."
                            value={generatedCode}
                        />
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/75 flex items-center justify-center rounded-md">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                            </div>
                        )}
                    </div>
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostmanTestGenerator;
