import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Eye, User } from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  author_name: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  views_count: number;
  tags: string[] | null;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts" as any)
        .select("id, title, slug, excerpt, author_name, featured_image_url, published_at, views_count, tags")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      setPosts((data as any) || []);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Our Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Insights, stories, and updates from our team
            </p>
          </div>

          {loading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Featured Article */}
              <Link to="/blog/llm-tat-scoring" className="group block mb-12">
                <Card className="overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-2 border-2 border-primary/20">
                  <div className="relative">
                    <Badge className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground px-4 py-1.5 text-sm font-bold shadow-lg">
                      ⭐ Featured
                    </Badge>
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-8">
                        <div className="text-center">
                          <div className="text-6xl mb-4">🤖</div>
                          <h3 className="text-2xl font-bold text-primary">LLM + TAT</h3>
                        </div>
                      </div>
                      <CardHeader className="space-y-4 py-8">
                        <CardTitle className="text-3xl group-hover:text-primary transition-colors">
                          Beyond the Bag-of-Words: Elevating TAT Scoring via Large Language Models
                        </CardTitle>
                        <CardDescription className="text-base leading-relaxed">
                          Discover how Large Language Models like GPT-4 can revolutionize Thematic Apperception Test scoring, 
                          moving beyond traditional keyword matching to achieve near-human accuracy (95%+) in psychological assessment.
                        </CardDescription>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Badge variant="secondary">AI & Psychology</Badge>
                          <Badge variant="secondary">Research</Badge>
                          <Badge variant="secondary">TAT Methodology</Badge>
                        </div>
                      </CardHeader>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Regular Posts */}
              {posts.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-muted-foreground">No blog posts published yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post) => (
                    <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                      <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                        {post.featured_image_url && (
                          <div className="overflow-hidden rounded-t-lg">
                            <img
                              src={post.featured_image_url}
                              alt={post.title}
                              className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                            {post.title}
                          </CardTitle>
                          {post.excerpt && (
                            <CardDescription className="line-clamp-3">
                              {post.excerpt}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags?.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            {post.author_name && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {post.author_name}
                              </div>
                            )}
                            {post.published_at && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(post.published_at), "MMM d, yyyy")}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.views_count}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
