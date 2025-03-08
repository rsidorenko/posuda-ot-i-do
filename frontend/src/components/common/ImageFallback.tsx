import React from 'react';

const ImageFallback: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className }) => {
  const [error, setError] = React.useState(false);

  const handleError = () => {
    setError(true);
  };

  if (error) {
    return (
      <div 
        className={className}
        style={{
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '0.8rem',
          textAlign: 'center',
          padding: '1rem'
        }}
      >
        {alt || 'Изображение недоступно'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};

export default ImageFallback; 