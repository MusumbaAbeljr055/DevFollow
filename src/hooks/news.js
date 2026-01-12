// src/hooks/news.js - UPDATED WITH PROGRAMMING SHORTS
import { useEffect, useState } from 'react';

export function useProgrammingNews() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgrammingNews = async () => {
      try {
        setIsLoading(true);
        
        // Create programming shorts (TikTok style content)
        const programmingShorts = getProgrammingShorts();
        
        if (programmingShorts.length > 0) {
          setNews(programmingShorts);
        } else {
          setNews(getDefaultShorts());
        }

      } catch (err) {
        console.error('Error fetching news:', err);
        setError(err.message);
        setNews(getDefaultShorts());
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgrammingNews();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchProgrammingNews, 300000);
    return () => clearInterval(interval);
  }, []);

  // Get programming shorts (TikTok style)
  const getProgrammingShorts = () => {
    return [
      {
        title: "Python List Comprehensions",
        url: "https://www.youtube.com/embed/kqtD5dpn9C8",
        description: "Master Python list comprehensions in 60 seconds",
        publishedAt: new Date().toISOString(),
        source: "Python Shorts",
        tags: ['Python', 'Tips', 'Quick']
      },
      {
        title: "JavaScript Arrow Functions",
        url: "https://www.youtube.com/embed/DHjqpvDnNGE",
        description: "Learn arrow functions vs regular functions",
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        source: "JS Shorts",
        tags: ['JavaScript', 'ES6', 'Functions']
      },
      {
        title: "CSS Flexbox in 60s",
        url: "https://www.youtube.com/embed/OEV8gMkCHXQ",
        description: "Quick guide to CSS Flexbox layout",
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        source: "CSS Shorts",
        tags: ['CSS', 'Layout', 'Web Design']
      },
      {
        title: "React Hooks Basics",
        url: "https://www.youtube.com/embed/Tn6-PIqc4UM",
        description: "Understanding useState and useEffect",
        publishedAt: new Date(Date.now() - 259200000).toISOString(),
        source: "React Shorts",
        tags: ['React', 'Hooks', 'Frontend']
      },
      {
        title: "Git Commands You Need",
        url: "https://www.youtube.com/embed/USjZcfj8yxE",
        description: "Essential Git commands every dev should know",
        publishedAt: new Date(Date.now() - 345600000).toISOString(),
        source: "Git Shorts",
        tags: ['Git', 'Version Control', 'Tools']
      },
      {
        title: "Python Decorators",
        url: "https://www.youtube.com/embed/FXUUSfJO_J4",
        description: "Learn Python decorators with examples",
        publishedAt: new Date(Date.now() - 432000000).toISOString(),
        source: "Python Shorts",
        tags: ['Python', 'Decorators', 'Advanced']
      },
      {
        title: "HTML5 Semantic Tags",
        url: "https://www.youtube.com/embed/ok-plXXHlWw",
        description: "Modern HTML5 semantic elements",
        publishedAt: new Date(Date.now() - 518400000).toISOString(),
        source: "HTML Shorts",
        tags: ['HTML5', 'Semantic', 'Web']
      },
      {
        title: "Async/Await in JS",
        url: "https://www.youtube.com/embed/vn3tm0quoqE",
        description: "Master async/await in JavaScript",
        publishedAt: new Date(Date.now() - 604800000).toISOString(),
        source: "JS Shorts",
        tags: ['JavaScript', 'Async', 'Promises']
      },
      {
        title: "C++ Pointers Explained",
        url: "https://www.youtube.com/embed/MNeX4EGtR5Y",
        description: "Understanding pointers in C++",
        publishedAt: new Date(Date.now() - 691200000).toISOString(),
        source: "C++ Shorts",
        tags: ['C++', 'Pointers', 'Memory']
      },
      {
        title: "CSS Grid Basics",
        url: "https://www.youtube.com/embed/9zBsdzdE4sM",
        description: "Quick start with CSS Grid",
        publishedAt: new Date(Date.now() - 777600000).toISOString(),
        source: "CSS Shorts",
        tags: ['CSS', 'Grid', 'Layout']
      }
    ];
  };

  // Default shorts if API fails
  const getDefaultShorts = () => {
    return [
      {
        title: "Python for Beginners",
        url: "https://www.youtube.com/embed/kqtD5dpn9C8",
        description: "Start your Python journey",
        publishedAt: new Date().toISOString(),
        source: "Python",
        tags: ['Python', 'Beginner']
      },
      {
        title: "JavaScript Fundamentals",
        url: "https://www.youtube.com/embed/DHjqpvDnNGE",
        description: "Learn JS basics quickly",
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        source: "JavaScript",
        tags: ['JavaScript', 'Web']
      },
      {
        title: "HTML & CSS Crash Course",
        url: "https://www.youtube.com/embed/ok-plXXHlWw",
        description: "Build your first webpage",
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        source: "Web Dev",
        tags: ['HTML', 'CSS', 'Web']
      }
    ];
  };

  return { news, isLoading, error };
}