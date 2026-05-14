import Hero from "@/components/Hero";
import FeaturedCollections from "@/components/FeaturedCollections";
import ProductGrid from "@/components/ProductGrid";
import LifestyleBanner from "@/components/LifestyleBanner";
import BrandStory from "@/components/BrandStory";
import InstagramGallery from "@/components/InstagramGallery";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCollections />
      <ProductGrid
        title="Trending Now"
        label="Most Loved"
        filter="trending"
        viewAllHref="/category/sneakers"
        limit={6}
        bg="#ffffff"
      />
      <LifestyleBanner />
      <ProductGrid
        title="New Arrivals"
        label="Just Dropped"
        filter="new"
        viewAllHref="/new-arrivals"
        limit={30}
        bg="#f5f5f5"
      />
      <BrandStory />
      <ProductGrid
        title="Editor's Picks"
        label="Featured"
        filter="featured"
        viewAllHref="/category/sneakers"
        limit={6}
        bg="#ffffff"
      />
      <InstagramGallery />
      <Testimonials />
      <Footer />
    </>
  );
}
