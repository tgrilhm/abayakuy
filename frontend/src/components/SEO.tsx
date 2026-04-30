import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  name?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title = "ABAYAKUY.OFFICIAL | Jastip Abaya Mesir", 
  description = "ABAYAKUY.OFFICIAL | Jastip Abaya Mesir. Temukan koleksi abaya pilihan terbaik langsung dari Mesir.", 
  name = "ABAYAKUY", 
  type = "website" 
}) => {
  const siteTitle = title.includes("ABAYAKUY") ? title : `${title} | ABAYAKUY`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name='description' content={description} />
      
      {/* Open Graph tags (Facebook, Instagram, etc) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

export default SEO;
