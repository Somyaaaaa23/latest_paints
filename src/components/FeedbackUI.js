import React, { useState, useMemo } from 'react';

export const VendorFeedbackButtons = ({ requirementId, vendor, productId, onFeedbackSubmit }) => {
    const [status, setStatus] = useState('idle'); // idle | sending | done
    const handle = async (approved) => {
        if (status === 'sending') return;
        setStatus('sending');
        try {
            await onFeedbackSubmit({ approved });
            setStatus('done');
            setTimeout(() => setStatus('idle'), 1200);
        } catch (e) {
            console.warn('feedback failed', e);
            setStatus('idle');
        }
    };

    return (
        <div className="flex items-center space-x-2 text-xs">
            <button
                onClick={() => handle(true)}
                className={`px-2 py-1 rounded bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 transition ${status === 'sending' ? 'opacity-60 cursor-not-allowed' : ''}`}
                title="Accept this recommendation"
            >
                ✓ Accept
            </button>
            <button
                onClick={() => handle(false)}
                className={`px-2 py-1 rounded bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 transition ${status === 'sending' ? 'opacity-60 cursor-not-allowed' : ''}`}
                title="Reject this recommendation"
            >
                ✗ Reject
            </button>
            {status === 'done' && <span className="text-green-600">Saved</span>}
        </div>
    );
};

export const LearningProgressIndicator = ({ stats }) => {
    const { count = 0, accept = 0, reject = 0, lora, accuracyGain = '0.0' } = stats || {};
    const pct = Math.min(100, (count / 200) * 100);
    const productionPct = Math.min(100, (count / 500) * 100);

    const stage = useMemo(() => {
        if (count >= 500) return '🚀 Production-ready (LoRA optimized)';
        if (count >= 200) return '🎓 Foundation trained (LoRA active)';
        return '📊 Collecting feedback';
    }, [count]);

    const loraStatus = lora?.initialized ? '✅ Active' : '⏳ Pending';
    const acceptanceRate = count > 0 ? ((accept / count) * 100).toFixed(1) : '0.0';

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">🧠 Learning Progress</span>
                <span className="text-gray-600">{count}/500 samples • LoRA: {loraStatus}</span>
            </div>

            {/* Foundation Progress (200 samples) */}
            <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Foundation ({count}/200)</span>
                    <span>{pct.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                </div>
            </div>

            {/* Production Progress (500 samples) */}
            <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Production ({count}/500)</span>
                    <span>{productionPct.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${productionPct}%` }}></div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-green-50 p-2 rounded">
                    <div className="text-green-800 font-bold">{accept}</div>
                    <div className="text-gray-600">Accepted</div>
                </div>
                <div className="bg-red-50 p-2 rounded">
                    <div className="text-red-800 font-bold">{reject}</div>
                    <div className="text-gray-600">Rejected</div>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                    <div className="text-blue-800 font-bold">{acceptanceRate}%</div>
                    <div className="text-gray-600">Accept Rate</div>
                </div>
            </div>

            <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                <div className="font-semibold mb-1">{stage}</div>
                <div>• Accuracy gain: +{accuracyGain}% (up to +15% at 500 samples)</div>
                <div>• Accept/Reject: {accept}/{reject} • Rate: {acceptanceRate}%</div>
                {lora?.initialized && (
                    <div className="text-green-700 font-semibold mt-1">
                        ✨ LoRA adapter active: {lora.trainedEpochs} epochs trained
                    </div>
                )}
            </div>
        </div>
    );
};
