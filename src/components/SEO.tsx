import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  type?: string;
  jsonLd?: Record<string, unknown>;
}

const SEO = ({ title, description, canonical, ogImage, type = "website", jsonLd }: SEOProps) => {
  const siteName = "Travyntra";
  const fullTitle = title === "Home" ? `${siteName} — Your Tour, Perfectly Personalised` : `${title} | ${siteName}`;
  const defaultImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage || defaultImage} />
      {canonical && <link rel="canonical" href={canonical} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
