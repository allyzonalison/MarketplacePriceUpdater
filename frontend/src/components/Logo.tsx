const Logo = () => {
  return (
    <div className="flex flex-col items-center">
      <img
        src="/logo.png"
        alt="668 Jewelry"
        className="mb-4 h-20 w-20 object-contain"
      />

      <p className="mt-2 text-sm text-gray-200">Marketplace Pricing Manager</p>
    </div>
  );
};

export default Logo;
