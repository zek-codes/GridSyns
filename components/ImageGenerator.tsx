import React, { useState } from 'react';
import { generateHomeImage } from '../services/geminiService';
import { Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { MODEL_IMAGE, ASPECT_RATIOS, IMAGE_SIZES } from '../constants';

export const ImageGenerator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("Futuristic eco-friendly smart home with solar panels, tesla cybertruck, cyberpunk style, cinematic lighting");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [imageSize, setImageSize] = useState("1K");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateHomeImage(prompt, aspectRatio, imageSize);
    setGeneratedImage(result);
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg hover:scale-105 transition-transform text-white group z-50"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-purple-400" />
            Dream Home Visualizer
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-2">PROMPT</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-2">ASPECT RATIO</label>
              <select 
                value={aspectRatio} 
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none"
              >
                {ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-2">RESOLUTION</label>
              <select 
                value={imageSize} 
                onChange={(e) => setImageSize(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none"
              >
                {IMAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-bold text-white shadow-lg hover:opacity-90 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            {loading ? "Generating Dream Home..." : "Generate Visualization"}
          </button>
          
          <p className="text-xs text-center text-gray-500 mt-2">
            Powered by {MODEL_IMAGE}. Requires API Key selection.
          </p>

          {generatedImage && (
            <div className="mt-6 border-t border-gray-700 pt-6 animate-in fade-in zoom-in duration-500">
               <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-700 relative group">
                  <img src={generatedImage} alt="Generated Home" className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a href={generatedImage} download="my-dream-home.png" className="bg-white text-black px-4 py-2 rounded-full font-bold">Download</a>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
