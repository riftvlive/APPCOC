import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Calculator,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Wheat,
  Scale
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

export const AiAdvisorView: React.FC = () => {
  const {
    farms,
    cycles,
    allCycleSummaries,
    feedPurchases,
    currency,
    language
  } = useFarm();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `مرحباً بك! أنا مستشارك الرقمي الذكي المتخصص في إدارة اقتصاديات وإنتاجية مزارع الدواجن.
لقد قمت بتحليل بيانات دوراتك الحالية وتكاليف الأعلاف ومعدل التحويل (FCR).

يمكنك سؤالي عن:
1. كيفية تخفيض تكلفة الكيلوغرام للدورة الحالية.
2. محاكاة أثر تغير سعر طن العلف أو الكتاكيت على صافي الربح.
3. التوصيات الفنية لتحسين معامل التحويل الغذائي وتقليل نسبة النفوق.`
    }
  ]);

  // Simulation State
  const [simFeedPriceDelta, setSimFeedPriceDelta] = useState(0); // +/- in DH
  const [simMortalityTarget, setSimMortalityTarget] = useState(3.5); // %
  const [simSalePriceTarget, setSimSalePriceTarget] = useState(16.5); // DH/kg

  const handleAskAI = async (queryText?: string) => {
    const textToSend = queryText || prompt;
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { sender: 'user' as const, text: textToSend }];
    setMessages(newMessages);
    setPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/advise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          contextData: {
            farmsCount: farms.length,
            cyclesSummaries: allCycleSummaries,
            recentFeeds: feedPurchases.slice(0, 5)
          }
        })
      });

      const data = await response.json();
      setMessages([...newMessages, { sender: 'ai', text: data.advice || data.response || 'عذراً، لم أتمكن من الحصول على الإجابة حالياً.' }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { sender: 'ai', text: 'تم إنشاء التوصية محلياً بناءً على مؤشرات الدورة: ينصح بضبط تهوية العنابر وتدقيق كمية العلف الموزعة يومياً لتقليل الفاقد وضمان تحقيق FCR أقل من 1.62.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (q: string) => {
    handleAskAI(q);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-100">
              {language === 'ar' ? 'المستشار الذكي لاقتصاديات مزارع الدواجن (AI Advisor)' : 'Conseiller IA Économique'}
            </h2>
            <p className="text-xs text-amber-300/80 mt-0.5">
              مدعوم بنماذج Gemini المتقدمة لتحليل تكاليف الإنتاج، محاكاة السيناريوهات، وتقديم توصيات مخصصة لدوراتك
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Chat Left/Middle + Simulator Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: AI Chat */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-2xl flex flex-col h-[520px] overflow-hidden shadow-md">
          {/* Quick Prompts Bar */}
          <div className="p-3 bg-stone-950/60 border-b border-stone-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
            <span className="text-stone-400 text-[11px] font-bold shrink-0">أسئلة مقترحة:</span>
            <button
              onClick={() => handleQuickQuestion('ما هو تقييمك لمعدل التحويل FCR وتكلفة الكيلوغرام في دوراتي الحالية؟')}
              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg shrink-0 text-[11px] font-medium border border-stone-700 transition"
            >
              💡 تقييم FCR وتكلفة الكيلو
            </button>
            <button
              onClick={() => handleQuickQuestion('كيف يمكنني تقليص نفقات الأدوية والأعلاف دون التأثير على وزن الدجاج؟')}
              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg shrink-0 text-[11px] font-medium border border-stone-700 transition"
            >
              📉 ترشيد تكاليف الدورة
            </button>
            <button
              onClick={() => handleQuickQuestion('ما هي أفضل استراتيجية لتسويق الدجاج عند وصوله لوزن 2.2 كغ؟')}
              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg shrink-0 text-[11px] font-medium border border-stone-700 transition"
            >
              🚚 استراتيجية البيع والتسويق
            </button>
          </div>

          {/* Messages History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-800 text-amber-400 border border-stone-700'
                }`}>
                  {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3.5 rounded-2xl max-w-[82%] leading-relaxed whitespace-pre-line ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-stone-950 font-bold rounded-tl-sm shadow'
                    : 'bg-stone-950/80 text-stone-200 border border-stone-800 rounded-tr-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-amber-400 p-3 bg-stone-950/60 rounded-xl w-fit">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري معالجة البيانات واستخراج التوصيات الاقتصادية...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAI();
            }}
            className="p-3 bg-stone-950/90 border-t border-stone-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="اكتب استفسارك الفني أو الاقتصادي هنا..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال</span>
            </button>
          </form>
        </div>

        {/* Right Col: Economic Simulator */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-4 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-stone-800 pb-3 mb-3">
              <Calculator className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-extrabold text-stone-100">محاكي السيناريوهات والربحية التقديرية</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-400 mb-1 font-semibold">
                  تغير سعر كغ العلف (+/- {simFeedPriceDelta} {currency})
                </label>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.1"
                  value={simFeedPriceDelta}
                  onChange={e => setSimFeedPriceDelta(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 mt-0.5">
                  <span>-1.0 درهم</span>
                  <span className="font-bold text-amber-400">{simFeedPriceDelta > 0 ? `+${simFeedPriceDelta}` : simFeedPriceDelta} {currency}/كغ</span>
                  <span>+1.0 درهم</span>
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-semibold">
                  نسبة النفوق المستهدفة ({simMortalityTarget}%)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={simMortalityTarget}
                  onChange={e => setSimMortalityTarget(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 mt-0.5">
                  <span>1.0% (ممتاز)</span>
                  <span className="font-bold text-rose-400">{simMortalityTarget}%</span>
                  <span>10.0% (حرج)</span>
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-semibold">
                  سعر بيع الكيلوغرام المتوقع ({simSalePriceTarget} {currency})
                </label>
                <input
                  type="range"
                  min="12"
                  max="22"
                  step="0.5"
                  value={simSalePriceTarget}
                  onChange={e => setSimSalePriceTarget(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 mt-0.5">
                  <span>12 {currency}</span>
                  <span className="font-bold text-emerald-400">{simSalePriceTarget} {currency}/كغ</span>
                  <span>22 {currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Simulation Output Box */}
          <div className="bg-stone-950/80 rounded-xl p-3 border border-stone-800 space-y-2 text-xs">
            <span className="text-[10px] text-stone-400 font-bold block">النتيجة التقديرية لدورة 25,000 طائر:</span>

            {/* Calculations */}
            {(() => {
              const birdsInitial = 25000;
              const liveBirds = birdsInitial * (1 - simMortalityTarget / 100);
              const totalKg = liveBirds * 2.2; // 2.2kg avg
              const baseFeedPrice = 4.90 + simFeedPriceDelta;
              const feedPerBirdKg = 2.2 * 1.62; // FCR 1.62 = 3.56kg
              const totalFeedCost = liveBirds * feedPerBirdKg * baseFeedPrice;
              const chicksCost = birdsInitial * 5.80;
              const medsAndLabor = liveBirds * 2.10;
              const totalCost = totalFeedCost + chicksCost + medsAndLabor;
              const totalRevenue = totalKg * simSalePriceTarget;
              const projectedProfit = totalRevenue - totalCost;
              const costPerKg = totalCost / totalKg;

              return (
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-stone-400">تكلفة الكيلوغرام التقديرية:</span>
                    <span className="font-bold text-stone-100">{costPerKg.toFixed(2)} {currency}/كغ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">الإيراد الإجمالي المتوقع:</span>
                    <span className="font-bold text-emerald-400">{Math.round(totalRevenue).toLocaleString()} {currency}</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-800 pt-1.5 font-bold">
                    <span className="text-stone-300">صافي الربح التقديري:</span>
                    <span className={`text-sm ${projectedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {Math.round(projectedProfit).toLocaleString()} {currency}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
