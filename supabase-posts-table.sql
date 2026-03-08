-- Supabase SQL Editor에서 실행하세요.
-- 따뜻한 게시판(PostBoard) 기능을 위한 posts 테이블 생성

CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Row Level Security (RLS) 설정 - 모든 사용자가 읽기/쓰기 가능
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on posts"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access on posts"
  ON posts FOR INSERT
  WITH CHECK (true);
