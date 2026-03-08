"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function PostBoard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("posts")
        .select("id, title, content, created_at")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setPosts(data || []);
    } catch (err) {
      console.error("게시글 로딩 실패:", err);
      setError(err instanceof Error ? err.message : "게시글을 불러올 수 없습니다.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("제목과 본문을 모두 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from("posts").insert({
        title: title.trim(),
        content: content.trim(),
      });

      if (insertError) throw insertError;

      setTitle("");
      setContent("");
      await fetchPosts();
    } catch (err) {
      console.error("등록 실패:", err);
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="text-[28px] sm:text-[32px] font-black text-[#1E3A8A] mb-2 text-center">
        따뜻한 게시판
      </h2>
      <p className="text-xl text-slate-600 text-center mb-10">
        시니어분들이 자유롭게 소통하는 공간입니다 💙
      </p>

      {/* 글쓰기 양식 */}
      <form onSubmit={handleSubmit} className="mb-12 p-6 sm:p-8 bg-white rounded-2xl border-2 border-sky-200 shadow-lg shadow-sky-100/50">
        <div className="space-y-6">
          <div>
            <label htmlFor="post-title" className="block text-xl font-bold text-slate-700 mb-2">
              제목
            </label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full px-5 py-4 text-xl border-2 border-slate-200 rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-sky-100 outline-none transition-all"
              disabled={submitting}
            />
          </div>
          <div>
            <label htmlFor="post-content" className="block text-xl font-bold text-slate-700 mb-2">
              본문
            </label>
            <textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 자유롭게 적어주세요"
              rows={5}
              className="w-full px-5 py-4 text-xl border-2 border-slate-200 rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-sky-100 outline-none transition-all resize-y"
              disabled={submitting}
            />
          </div>
          {error && (
            <p className="text-xl text-red-600 font-medium">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-5 px-6 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white text-xl font-bold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-sky-200/50 active:scale-[0.99]"
          >
            {submitting ? "등록 중..." : "등록하기"}
          </button>
        </div>
      </form>

      {/* 게시글 목록 */}
      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-6">최신 글</h3>
        {loading ? (
          <p className="text-xl text-slate-500 py-12 text-center">게시글을 불러오는 중입니다...</p>
        ) : posts.length === 0 ? (
          <p className="text-xl text-slate-500 py-12 text-center bg-white rounded-2xl border-2 border-slate-100">
            아직 등록된 글이 없습니다. 첫 번째 글이 되어 보세요! ✨
          </p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li
                key={post.id}
                className="p-6 bg-white rounded-2xl border-2 border-sky-100 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/50 transition-all"
              >
                <h4 className="text-xl font-bold text-[#1E3A8A] mb-2 break-keep">
                  {post.title}
                </h4>
                <p className="text-xl text-slate-600 leading-relaxed break-keep whitespace-pre-wrap">
                  {post.content}
                </p>
                <p className="text-lg text-slate-400 mt-4">
                  {new Date(post.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
