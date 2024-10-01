import React, { useState } from "react";
import './StorySlider.css';
import { useSelector } from "react-redux/es/hooks/useSelector";
import downloadIcon from "../../../assets/download.png"; 
import tickIcon from "../../../assets/tick.png"; // Import your tick icon

// Helper to get YouTube embed URL
const getYouTubeEmbedUrl = (url) => {
  const videoId = url.split('v=')[1] || url.split('/').pop(); // Extract YouTube video ID
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
};

// Slide Component
const Slide = ({ slides, imgIndex }) => {
  const { isSmallScreen } = useSelector((state) => state.layout);
  const [downloadedSlides, setDownloadedSlides] = useState(new Set()); // Track downloaded slides

  // Function to handle downloading the current slide (image or video)
  const handleDownloadSlide = async (url, mediaType, heading, index) => {
    // Check if the slide has already been downloaded
    if (downloadedSlides.has(index)) return; // Prevent downloading again if already downloaded
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to download ${mediaType}`);
  
      const blob = await response.blob();
      const link = document.createElement("a");
      const fileType = mediaType === 'image' ? 'jpg' : 'mp4'; // Set appropriate file extension
      const downloadName = `${heading || `slide_${index + 1}`}.${fileType}`;

      const objectUrl = window.URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = downloadName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
      
      // Add the slide index to the downloaded set
      setDownloadedSlides((prev) => new Set(prev).add(index));
    } catch (error) {
      console.error(`Failed to download the ${mediaType}:`, error);
    }
  };
  
  return (
    <div className="slides" style={{ width: "100%", height: '100%' }}>
      {slides && slides.map((slide, index) => (
        <div key={slide._id} style={{ display: index === imgIndex ? "block" : "none" }}>
          {/* Check if the slide is an image */}
          {slide.mediaType === 'image' ? (
            <>
              <img
                className="slide_image"
                style={{ width: "100%", height: isSmallScreen ? '100vh' : "90vh" }}
                src={slide.imageUrl}
                alt={`Slide ${index}`}
              />
              {/* Add download button for the image */}
              <button
                onClick={() => handleDownloadSlide(slide.imageUrl, 'image', slide.heading, index)}
                className="download_button"
              >
                <img src={downloadedSlides.has(index) ? tickIcon : downloadIcon} alt="download" />
              </button>
            </>
          ) : slide.mediaType === 'video' ? (
            // Check if the video is from YouTube
            slide.imageUrl.includes('youtube.com') || slide.imageUrl.includes('youtu.be') ? (
              <>
                <iframe
                  width="100%"
                  height={isSmallScreen ? '100vh' : "650vh"}
                  src={getYouTubeEmbedUrl(slide.imageUrl)}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={`YouTube video ${index}`}
                ></iframe>
                {/* Add download button for YouTube videos */}
                <button
                  onClick={() => handleDownloadSlide(slide.imageUrl, 'video', slide.heading, index)}
                  className="download_button"
                >
                  <img src={downloadedSlides.has(index) ? tickIcon : downloadIcon} alt="download" />
                </button>
              </>
            ) : (
              <>
                <video
                  className="slide_video"
                  controls
                  style={{ width: "100%", height: isSmallScreen ? '100vh' : "90vh" }}
                >
                  <source src={slide.imageUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {/* Add download button for the video */}
                <button
                  onClick={() => handleDownloadSlide(slide.imageUrl, 'video', slide.heading, index)}
                  className="download_button"
                >
                  <img src={downloadedSlides.has(index) ? tickIcon : downloadIcon} alt="download" />
                </button>
              </>
            )
          ) : null}

          {/* Display slide text */}
          <div className="slide_text">
            <h1 className="slide_heading">{slide.heading}</h1>
            <p className="slide_p">{slide.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Slide;
