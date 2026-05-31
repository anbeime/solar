'use client';

import { useState, useRef, useEffect } from 'react';
import { Brain, Send, Loader2, Cpu, ChevronDown, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PageLayout } from '@/components/page-layout';

type AIProvider = 'nvidia' | 'zhipuai';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  loading?: boolean;
}

const PROVIDER_OPTIONS: { value: AIProvider; label: string; desc: string }[] = [
  { value: 'zhipuai', label: '智谱AI (推荐)', desc: 'GLM-4-Flash - 稳定快速' },
  { value: 'nvidia', label: 'NVIDIA NIM', desc: 'Llama-3.1-70B' },
];

const PRESET_QUESTIONS = [
  '最近有哪些光伏项目在招标？',
  '帮我查一下广东省的储能项目',
  '2026年光伏行业有哪些发展趋势？',
  '帮我分析一下某个网址的内容：https://example.com',
];

export default function AIPage() {
  const [inputContent, setInputContent] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [provider, setProvider] = useState<AIProvider>('zhipuai');
  const [providerOpen, setProviderOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputContent;
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };
    setMessages(prev => [...prev, userMessage]);
    if (!text) setInputContent('');

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      loading: true,
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const resp = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, provider }),
      });
      const data = await resp.json();
      setMessages(prev => prev.map(m => 
        m.id === assistantMessage.id 
          ? { ...m, content: data.content, sources: data.sources, loading: false }
          : m
      ));
    } catch (e) {
      setMessages(prev => prev.map(m => 
        m.id === assistantMessage.id 
          ? { ...m, content: '抱歉，服务暂时不可用', loading: false }
          : m
      ));
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">AI智能助手</h1>
            <p className="text-sm text-slate-500">光伏储能行业智能问答助手</p>
          </div>
        </div>

        <div className="relative mb-4">
          <button
            onClick={() => setProviderOpen(!providerOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:border-slate-300 transition-colors"
          >
            <Cpu className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-slate-900">{PROVIDER_OPTIONS.find(p => p.value === provider)?.label}</span>
            <span className="text-xs text-slate-400">{PROVIDER_OPTIONS.find(p => p.value === provider)?.desc}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${providerOpen ? 'rotate-180' : ''}`} />
          </button>
          {providerOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
              {PROVIDER_OPTIONS.map(p => (
                <button
                  key={p.value}
                  onClick={() => { setProvider(p.value); setProviderOpen(false); }}
                  className={`w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${provider === p.value ? 'bg-blue-50' : ''}`}
                >
                  <p className="text-sm font-medium text-slate-900">{p.label}</p>
                  <p className="text-xs text-slate-500">{p.desc}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-green-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            我可以帮你：搜索项目/招标/中标数据、抓取网页分析、查询天气电价
          </p>
        </div>

        <div ref={scrollRef} className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">问我任何关于光伏储能的问题</p>
              <div className="flex flex-wrap justify-center gap-2">
                {PRESET_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-sm text-slate-600 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map(m => (
            <Card key={m.id} className={m.role === 'user' ? 'bg-blue-50 border-blue-200' : 'bg-white'}>
              <CardContent className="p-4">
                {m.loading ? (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">思考中...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {m.content ? (
                        m.content.split('\n').map((line, i) => (
                          <p key={i} className={i === 0 ? '' : 'mt-2'}>{line || '\u00A0'}</p>
                        ))
                      ) : (
                        <p className="text-slate-400 italic">(无回复内容)</p>
                      )}
                    </div>
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <p className="text-xs text-slate-500">参考：{m.sources.join(', ')}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2">
          <Textarea
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="输入你的问题..."
            className="min-h-[44px] resize-none"
          />
          <Button onClick={() => handleSend()} disabled={!inputContent.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}