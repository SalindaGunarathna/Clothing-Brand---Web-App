import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { formatPrice } from '../lib/utils';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { fetchFeaturedProducts } from '../state/productsSlice';
export function HomePage() {
  const dispatch = useAppDispatch();
  const { featured, featuredStatus } = useAppSelector(
    (state) => state.products
  );

  React.useEffect(() => {
    if (featuredStatus === 'idle') {
      dispatch(fetchFeaturedProducts());
    }
  }, [dispatch, featuredStatus]);
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=2000"
            alt="Hero"
            className="h-full w-full object-cover object-center" />

          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-start text-white">
          <div className="max-w-xl space-y-6 animate-slide-up">
            <span className="text-sm tracking-[0.2em] uppercase font-medium">
              Spring / Summer 2025
            </span>
            <h1 className="text-5xl md:text-7xl font-serif leading-tight">
              The New <br /> Collection
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-md font-light">
              Timeless pieces crafted for the modern wardrobe. Discover the art
              of understated luxury.
            </p>
            <div className="pt-4">
              <Link to="/shop">
                <Button size="lg" variant="accent" className="min-w-[160px]">
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
            {
              name: 'Women',
              image:
              'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
              link: '/shop?category=WOMEN'
            },
            {
              name: 'Men',
              image:
              'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=800',
              link: '/shop?category=MEN'
            },
            {
              name: 'Kids',
              image:
              'https://images.unsplash.com/photo-1519238263496-6361937a42d8?auto=format&fit=crop&q=80&w=800',
              link: '/shop?category=KIDS'
            }].
            map((cat) =>
            <Link
              key={cat.name}
              to={cat.link}
              className="group relative h-[500px] overflow-hidden rounded-sm">

                <img
                src={cat.image}
                alt={cat.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />

                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-3xl font-serif text-white tracking-wide">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-2">Just In</h2>
              <p className="text-text-secondary">
                Curated essentials for the season.
              </p>
            </div>
            <Link
              to="/shop"
              className="group flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors">

              View All{' '}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(featuredStatus === 'loading' || featuredStatus === 'idle') &&
            [0, 1, 2].map((idx) =>
            <Skeleton key={idx} variant="productCard" />
            )}
            {featuredStatus === 'failed' && featured.length === 0 &&
            <p className="text-sm text-text-secondary">
                Unable to load featured products.
              </p>
            }
            {featuredStatus !== 'loading' &&
            featured.map((product) =>
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group">

                <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-surface-alt mb-4">
                  <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />

                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-text-secondary">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 bg-surface-alt">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <img
                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200"
                alt="Atelier"
                className="rounded-sm shadow-xl" />

            </div>
            <div className="order-1 md:order-2 space-y-6 md:pl-12">
              <h2 className="text-3xl md:text-4xl font-serif">
                Crafted with Care
              </h2>
              <p className="text-text-secondary leading-relaxed">
                At MAISON, we believe in the beauty of simplicity. Our
                collections are designed in our Stockholm atelier, focusing on
                quality materials, precise tailoring, and sustainable production
                methods. We create pieces that are meant to be loved and worn
                for years, not just seasons.
              </p>
              <Button variant="secondary">Read Our Story</Button>
            </div>
          </div>
        </div>
      </section>
    </div>);

}
