// Spinner
export const Spinner = ({ size = 'sm' }) => {
  const sz = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size];
  return (
    <div className={`${sz} border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin`} />
  );
};

export default Spinner;
