// src/components/Dashboard/NewsSidebar.jsx - FIXED AUDIO DUPLICATION
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Spinner,
  Badge,
  Flex,
  HStack,
  Icon,
  IconButton,
  useBreakpointValue
} from '@chakra-ui/react';
import { 
  FiChevronLeft, 
  FiChevronRight,
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiHeart,
  FiMessageCircle,
  FiShare,
  FiExternalLink
} from 'react-icons/fi';
import { 
  FaPython, 
  FaJs, 
  FaJava, 
  FaReact, 
  FaGitAlt, 
  FaCss3Alt,
  FaHtml5,
  FaNodeJs,
  FaYoutube
} from 'react-icons/fa';

const NewsSidebar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likes, setLikes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [realShorts, setRealShorts] = useState([]);
  const iframeRefs = useRef([]);
  const autoPlayRef = useRef(null);
  
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // Coding videos from specific channels only - NO DUPLICATE LANGUAGES
  const fetchCodingVideos = () => {
    setIsLoading(true);
    
    // Videos from Bro Code, Mosh Hamedani, and Giraffe Academy
    // Each video has unique language to avoid repetition
    const codingShorts = [
      // Bro Code Videos
      {
        id: 1,
        title: "Python Full Course for Beginners",
        description: "Complete Python tutorial for absolute beginners",
        language: 'Python',
        videoUrl: "https://www.youtube.com/embed/XKHEtdqhLK8?autoplay=1&controls=0&modestbranding=1&rel=0",
        thumbnail: "https://img.youtube.com/vi/XKHEtdqhLK8/maxresdefault.jpg",
        channel: "Bro Code",
        likes: 45678,
        comments: 1234,
        shares: 2345,
        timestamp: "2h ago"
      },
      {
        id: 2,
        title: "JavaScript Full Course",
        description: "Learn JavaScript from scratch",
        language: 'JavaScript',
        videoUrl: "https://www.youtube.com/embed/8dWL3wF_OMw?autoplay=1&controls=0&modestbranding=1&rel=0",
        thumbnail: "https://img.youtube.com/vi/8dWL3wF_OMw/maxresdefault.jpg",
        channel: "Bro Code",
        likes: 34567,
        comments: 987,
        shares: 1567,
        timestamp: "5h ago"
      },
      {
        id: 3,
        title: "HTML & CSS Full Course",
        description: "Web development fundamentals",
        language: 'HTML/CSS',
        videoUrl: "https://www.youtube.com/embed/HGTJBPNC-Gw?autoplay=1&controls=0&modestbranding=1&rel=0",
        thumbnail: "https://img.youtube.com/vi/HGTJBPNC-Gw/maxresdefault.jpg",
        channel: "Bro Code",
        likes: 28901,
        comments: 756,
        shares: 1345,
        timestamp: "1d ago"
      },
      {
        id: 4,
        title: "Java Full Course",
        description: "Complete Java programming tutorial",
        language: 'Java',
        videoUrl: "https://www.youtube.com/embed/xk4_1vDrzzo?autoplay=1&controls=0&modestbranding=1&rel=0",
        thumbnail: "https://img.youtube.com/vi/xk4_1vDrzzo/maxresdefault.jpg",
        channel: "Bro Code",
        likes: 32109,
        comments: 876,
        shares: 1456,
        timestamp: "3h ago"
      },
      
      // Mosh Hamedani Videos - DIFFERENT LANGUAGES
      {
        id: 5,
        title: "C# Basics for Beginners",
        description: "Learn C# programming fundamentals",
        language: 'C#',
        videoUrl: "https://www.youtube.com/embed/gfkTfcpWqAY?autoplay=1&controls=0&modestbranding=1&rel=0",
        thumbnail: "https://img.youtube.com/vi/gfkTfcpWqAY/maxresdefault.jpg",
        channel: "Programming with Mosh",
        likes: 51234,
        comments: 1456,
        shares: 2678,
        timestamp: "8h ago"
      },
      {
        id: 6,
        title: "React JS Tutorial for Beginners",
        description: "Learn React from scratch",
        language: 'React',
        videoUrl: "https://www.youtube.com/embed/Ke90Tje7VS0?autoplay=1&controls=0&modestbranding=1&rel=0",
        thumbnail: "https://img.youtube.com/vi/Ke90Tje7VS0/maxresdefault.jpg",
        channel: "Programming with Mosh",
        likes: 43210,
        comments: 1678,
        shares: 2789,
        timestamp: "6h ago"
      },
      {
        id: 7,
        title: "Node.js Tutorial for Beginners",
        description: "Learn Node.js backend development",
        language: 'Node.js',
        videoUrl: "https://www.youtube.com/embed/TlB_eWDSMt4?autoplay=1&controls=0&modestbranding=1&rel=0",
        thumbnail: "https://img.youtube.com/vi/TlB_eWDSMt4/maxresdefault.jpg",
        channel: "Programming with Mosh",
        likes: 39876,
        comments: 1345,
        shares: 2456,
        timestamp: "4h ago"
      },
      {
        id: 8,
        title: "SQL Tutorial for Beginners",
        description: "Database programming with SQL",
        language: 'SQL',
        videoUrl: "https://www.youtube.com/embed/7S_tz1z_5bA?autoplay=1&controls=0&modestbranding=1&rel=0",
        thumbnail: "https://img.youtube.com/vi/7S_tz1z_5bA/maxresdefault.jpg",
        channel: "Programming with Mosh",
        likes: 37890,
        comments: 1234,
        shares: 2345,
        timestamp: "7h ago"
      },
      
      // Giraffe Academy Videos - DIFFERENT LANGUAGES
      {
        id: 9,
        title: "C++ Tutorial for Beginners",
        description: "Learn C++ programming language",
        language: 'C++',
        videoUrl: "https://www.youtube.com/embed/vLnPwxZdW4Y?autoplay=1&controls=0&modestbranding=1&rel=0",
        thumbnail: "https://img.youtube.com/vi/vLnPwxZdW4Y/maxresdefault.jpg",
        channel: "Giraffe Academy",
        likes: 47890,
        comments: 1654,
        shares: 2876,
        timestamp: "10h ago"
      },
      {
        id: 10,
        title: "PHP Tutorial for Beginners",
        description: "Learn PHP web development",
        language: 'PHP',
        videoUrl: "https://www.youtube.com/embed/OK_JCtrrv-c?autoplay=1&controls=0&modestbranding=1&rel=0",
        thumbnail: "https://img.youtube.com/vi/OK_JCtrrv-c/maxresdefault.jpg",
        channel: "Giraffe Academy",
        likes: 34567,
        comments: 1234,
        shares: 2345,
        timestamp: "9h ago"
      },
      {
        id: 11,
        title: "Git & GitHub Tutorial",
        description: "Version control system tutorial",
        language: 'Git',
        videoUrl: "https://www.youtube.com/embed/RGOj5yH7evk?autoplay=1&controls=0&modestbranding=1&rel=0",
        thumbnail: "https://img.youtube.com/vi/RGOj5yH7evk/maxresdefault.jpg",
        channel: "Giraffe Academy",
        likes: 29876,
        comments: 987,
        shares: 1678,
        timestamp: "11h ago"
      },
      {
        id: 12,
        title: "TypeScript Tutorial",
        description: "TypeScript programming fundamentals",
        language: 'TypeScript',
        videoUrl: "https://www.youtube.com/embed/gp5H0Vw39yw?autoplay=1&controls=0&modestbranding=1&rel=0",
        thumbnail: "https://img.youtube.com/vi/gp5H0Vw39yw/maxresdefault.jpg",
        channel: "Giraffe Academy",
        likes: 31234,
        comments: 1123,
        shares: 1987,
        timestamp: "8h ago"
      }
    ];

    setRealShorts(codingShorts);
    setIsLoading(false);
  };

  // Get language icon
  const getLanguageIcon = (language) => {
    switch(language?.toLowerCase()) {
      case 'python': return <FaPython />;
      case 'javascript': return <FaJs />;
      case 'java': return <FaJava />;
      case 'react': return <FaReact />;
      case 'html/css': return <FaHtml5 />;
      case 'html': return <FaHtml5 />;
      case 'css': return <FaCss3Alt />;
      case 'node.js': return <FaNodeJs />;
      case 'nodejs': return <FaNodeJs />;
      case 'git': return <FaGitAlt />;
      case 'c#': return <FaJs />;
      case 'c++': return <FaJs />;
      case 'php': return <FaJs />;
      case 'sql': return <FaDatabase />;
      case 'typescript': return <FaJs />;
      default: return <FaJs />;
    }
  };

  // Get language color
  const getLanguageColor = (language) => {
    switch(language?.toLowerCase()) {
      case 'python': return 'green';
      case 'javascript': return 'yellow';
      case 'java': return 'red';
      case 'react': return 'cyan';
      case 'html/css': return 'orange';
      case 'html': return 'orange';
      case 'css': return 'blue';
      case 'node.js': return 'green';
      case 'nodejs': return 'green';
      case 'git': return 'gray';
      case 'c#': return 'purple';
      case 'c++': return 'pink';
      case 'php': return 'blue';
      case 'sql': return 'teal';
      case 'typescript': return 'blue';
      default: return 'purple';
    }
  };

  // Handle like
  const handleLike = (id) => {
    setLikes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Stop previous video properly
  const stopPreviousVideo = (previousIndex) => {
    const previousIframe = iframeRefs.current[previousIndex];
    if (previousIframe && previousIframe.contentWindow) {
      // Stop the video completely
      previousIframe.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
      // Also pause it
      previousIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    }
  };

  // Navigation functions
  const nextVideo = () => {
    // Stop current video
    stopPreviousVideo(currentIndex);
    
    const nextIndex = (currentIndex + 1) % realShorts.length;
    setCurrentIndex(nextIndex);
    setIsPlaying(true);
    setIsLoading(true);
    
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current);
    }
  };

  const prevVideo = () => {
    // Stop current video
    stopPreviousVideo(currentIndex);
    
    const prevIndex = (currentIndex - 1 + realShorts.length) % realShorts.length;
    setCurrentIndex(prevIndex);
    setIsPlaying(true);
    setIsLoading(true);
    
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current);
    }
  };

  // Handle video play/pause - YouTube iframe API
  const handlePlayPause = () => {
    const iframe = iframeRefs.current[currentIndex];
    if (iframe && iframe.contentWindow) {
      if (isPlaying) {
        // Pause video
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      } else {
        // Play video
        iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Handle mute toggle
  const handleMuteToggle = () => {
    const iframe = iframeRefs.current[currentIndex];
    if (iframe && iframe.contentWindow) {
      if (isMuted) {
        // Unmute
        iframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
      } else {
        // Mute
        iframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
      }
    }
    setIsMuted(!isMuted);
  };

  // Clean up when component unmounts or index changes
  useEffect(() => {
    return () => {
      // Stop all videos when component unmounts
      iframeRefs.current.forEach((iframe, index) => {
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
        }
      });
      
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, []);

  // Stop previous video when index changes
  useEffect(() => {
    // Only stop previous video if there was a previous one
    const cleanup = () => {
      iframeRefs.current.forEach((iframe, index) => {
        if (iframe && index !== currentIndex && iframe.contentWindow) {
          iframe.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
        }
      });
    };
    
    return cleanup;
  }, [currentIndex]);

  // Auto-advance to next video
  useEffect(() => {
    if (isPlaying && realShorts.length > 1) {
      autoPlayRef.current = setTimeout(() => {
        nextVideo();
      }, 15000); // 15 seconds per short
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [currentIndex, isPlaying, realShorts]);

  // Fetch content on mount
  useEffect(() => {
    fetchCodingVideos();
  }, []);

  if (isLoading && realShorts.length === 0) {
    return (
      <Flex 
        h="600px" 
        align="center" 
        justify="center"
        bg="black"
        borderRadius="lg"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.400" />
          <Text color="white">Loading coding tutorials...</Text>
        </VStack>
      </Flex>
    );
  }

  const currentShort = realShorts[currentIndex] || {};

  return (
    <Box 
      width="100%"
      bg="black" 
      borderRadius="lg" 
      boxShadow="2xl" 
      p={0}
      height={isMobile ? "500px" : "600px"}
      position="relative"
      overflow="hidden"
    >
      {/* VIDEO PLAYER - SIMPLE */}
      <Box position="relative" height="100%" width="100%">
        {/* Loading Spinner */}
        {isLoading && (
          <Flex
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            zIndex={5}
          >
            <Spinner color="blue.400" size="xl" />
          </Flex>
        )}
        
        {/* YouTube Video Iframe */}
        {currentShort.videoUrl && (
          <iframe
            ref={el => iframeRefs.current[currentIndex] = el}
            key={currentShort.id}
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            src={`${currentShort.videoUrl}&enablejsapi=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={currentShort.title}
            onLoad={() => setIsLoading(false)}
          />
        )}

        {/* SIMPLE CONTENT OVERLAY - Top Only */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          p={4}
          bg="linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)"
        >
          <Flex justify="space-between" align="center">
            <Badge 
              colorScheme={getLanguageColor(currentShort.language)}
              fontSize="sm"
              display="flex"
              alignItems="center"
              gap={2}
              px={3}
              py={1}
              borderRadius="full"
              backdropFilter="blur(10px)"
              bg="rgba(0,0,0,0.5)"
            >
              {getLanguageIcon(currentShort.language)}
              {currentShort.language}
              <Text as="span" color="gray.300" ml={1}>
                • {currentShort.timestamp}
              </Text>
            </Badge>
            
            <Text color="white" fontSize="sm" opacity={0.8}>
              {currentIndex + 1}/{realShorts.length}
            </Text>
          </Flex>
        </Box>

        {/* SIMPLE CONTROLS - Bottom Center */}
        <Flex
          position="absolute"
          bottom={4}
          left="50%"
          transform="translateX(-50%)"
          align="center"
          justify="center"
          gap={2}
          zIndex={10}
          bg="rgba(0,0,0,0.5)"
          px={4}
          py={2}
          borderRadius="full"
          backdropFilter="blur(10px)"
        >
          {/* Previous Button */}
          {realShorts.length > 1 && (
            <IconButton
              icon={<FiChevronLeft />}
              onClick={prevVideo}
              aria-label="Previous"
              colorScheme="whiteAlpha"
              size="sm"
              borderRadius="full"
              isDisabled={currentIndex === 0}
            />
          )}

          {/* Play/Pause Button */}
          <IconButton
            icon={isPlaying ? <FiPause /> : <FiPlay />}
            onClick={handlePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
            colorScheme="whiteAlpha"
            size="md"
            borderRadius="full"
          />

          {/* Mute Button */}
          <IconButton
            icon={isMuted ? <FiVolumeX /> : <FiVolume2 />}
            onClick={handleMuteToggle}
            aria-label={isMuted ? "Unmute" : "Mute"}
            colorScheme="whiteAlpha"
            size="sm"
            borderRadius="full"
          />

          {/* Next Button */}
          {realShorts.length > 1 && (
            <IconButton
              icon={<FiChevronRight />}
              onClick={nextVideo}
              aria-label="Next"
              colorScheme="whiteAlpha"
              size="sm"
              borderRadius="full"
              isDisabled={currentIndex === realShorts.length - 1}
            />
          )}
        </Flex>

        {/* SIMPLE VIDEO INFO - Bottom Left */}
        <Box
          position="absolute"
          bottom={4}
          left={4}
          maxW="60%"
          zIndex={5}
        >
          <Text 
            fontWeight="bold" 
            color="white" 
            fontSize="lg" 
            mb={1}
            textShadow="0 2px 4px rgba(0,0,0,0.8)"
            noOfLines={1}
          >
            {currentShort.title}
          </Text>
          <Text 
            color="gray.300" 
            fontSize="sm"
            textShadow="0 1px 2px rgba(0,0,0,0.8)"
            noOfLines={1}
          >
            {currentShort.channel}
          </Text>
        </Box>

        {/* SIMPLE STATS - Bottom Right */}
        <VStack
          position="absolute"
          bottom={4}
          right={4}
          spacing={1}
          zIndex={5}
          align="flex-end"
        >
          <HStack spacing={3}>
            <Flex align="center" gap={1}>
              <Icon as={FiHeart} color="white" size="sm" />
              <Text color="white" fontSize="xs" fontWeight="bold">
                {currentShort.likes ? Math.floor(currentShort.likes / 1000) + 'K' : '0'}
              </Text>
            </Flex>
            <Flex align="center" gap={1}>
              <Icon as={FiMessageCircle} color="white" size="sm" />
              <Text color="white" fontSize="xs" fontWeight="bold">
                {currentShort.comments || '0'}
              </Text>
            </Flex>
            <Flex align="center" gap={1}>
              <Icon as={FiShare} color="white" size="sm" />
              <Text color="white" fontSize="xs" fontWeight="bold">
                {currentShort.shares || '0'}
              </Text>
            </Flex>
          </HStack>
          
          {/* Interactive Buttons */}
          <HStack spacing={2} mt={2}>
            <IconButton
              icon={likes[currentShort.id] ? <FiHeart fill="red" /> : <FiHeart />}
              onClick={() => handleLike(currentShort.id)}
              aria-label="Like"
              colorScheme="whiteAlpha"
              size="xs"
              borderRadius="full"
              color={likes[currentShort.id] ? "red.400" : "white"}
            />
            <IconButton
              icon={<FiExternalLink />}
              as="a"
              href={`https://youtube.com/watch?v=${currentShort.videoUrl?.split('/embed/')[1]?.split('?')[0]}`}
              target="_blank"
              aria-label="Open in YouTube"
              colorScheme="whiteAlpha"
              size="xs"
              borderRadius="full"
              color="white"
            />
          </HStack>
        </VStack>

        {/* PROGRESS DOTS - Minimal */}
        {realShorts.length > 1 && (
          <HStack
            position="absolute"
            bottom={20}
            left={0}
            right={0}
            spacing={1}
            zIndex={10}
            justify="center"
          >
            {realShorts.map((_, index) => (
              <Box
                key={index}
                h="3px"
                w="20px"
                bg={index === currentIndex ? "white" : "rgba(255,255,255,0.3)"}
                borderRadius="full"
                cursor="pointer"
                onClick={() => {
                  // Stop current video before switching
                  stopPreviousVideo(currentIndex);
                  
                  setCurrentIndex(index);
                  setIsPlaying(true);
                  setIsLoading(true);
                  
                  if (autoPlayRef.current) {
                    clearTimeout(autoPlayRef.current);
                  }
                }}
                transition="all 0.3s"
                _hover={{ bg: index === currentIndex ? "white" : "rgba(255,255,255,0.5)" }}
              />
            ))}
          </HStack>
        )}
      </Box>
    </Box>
  );
};

// Add missing FaDatabase import
import { FaDatabase } from 'react-icons/fa';

export default NewsSidebar;