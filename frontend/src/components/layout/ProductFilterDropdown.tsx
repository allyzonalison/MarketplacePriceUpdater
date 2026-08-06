import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const ProductFilterDropdown = ({ value, onChange }: Props) => {
  const Item = ({ text }: { text: string }) => (
    <MenuItem>
      {({ active }) => (
        <button
          onClick={() => onChange(text)}
          className={`w-full px-4 py-2 text-left ${active ? "bg-blue-50" : ""}`}
        >
          {text}
        </button>
      )}
    </MenuItem>
  );

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex w-64 items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2">
        {value}
        <ChevronDownIcon className="h-5 w-5" />
      </MenuButton>

      <MenuItems className="absolute z-50 mt-2 w-64 rounded-lg border bg-white shadow-xl">
        <Item text="All Products" />

        <div className="border-t my-1" />

        <div className="px-4 py-2 text-xs font-bold uppercase text-gray-400">
          Categories
        </div>

        <Item text="Earrings" />
        <Item text="Pendants" />
        <Item text="Bracelet_Anklet" />
        <Item text="Necklace" />
        <Item text="Ring" />

        <div className="border-t my-1" />

        <div className="px-4 py-2 text-xs font-bold uppercase text-gray-400">
          Special
        </div>

        <Item text="Electroform" />
        <Item text="Couple Rings" />
        <Item text="24K Gold Rings" />
        <Item text="Manual Pricing" />

        <div className="border-t my-1" />

        <div className="px-4 py-2 text-xs font-bold uppercase text-gray-400">
          Suppliers
        </div>

        <Item text="668" />
        <Item text="FG" />
        <Item text="SK" />
        <Item text="GS" />
      </MenuItems>
    </Menu>
  );
};

export default ProductFilterDropdown;
