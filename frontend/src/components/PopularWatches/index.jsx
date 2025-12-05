import ProductCard from "../ProductCard";

const PopularWatches = ({ watches, title }) => {
  return (
    <section className="w-full py-8 px-4 sm:px-6 lg:px-8" aria-labelledby={`popular-${title}`}>
      <h2 
        id={`popular-${title}`} 
        className="text-center text-2xl sm:text-3xl font-extrabold uppercase text-gray-800 mb-6"
      >
        {title}
      </h2>
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {watches.map((watch) => (
          <ProductCard key={watch.id || watch._id} product={watch} />
        ))}
      </div>
    </section>
  );
};

export default PopularWatches;