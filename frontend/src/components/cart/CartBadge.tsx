import React from 'react';
import { useAppSelector } from '../../store/hooks';

const CartBadge: React.FC = () => {
  const { totalItems } = useAppSelector((state) => state.cart);

  if (totalItems === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
      {totalItems}
    </span>
  );
};

export default CartBadge; 