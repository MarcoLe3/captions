interface Props {
  onClick: () => void;
}

export default function StartMicrophone({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="p-2 text-white font-medium bg-blue-500 w-[80px] rounded-lg hover:cursor-pointer"
    >
      Stop
    </button>
  );
}