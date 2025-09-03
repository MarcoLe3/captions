interface InputProp {
    word: string
}

const Input = ({ word }: InputProp) => {
  return (
    <div className="p-4 text-white text-medium ">
      {word}
    </div>
  );
};

export default Input;
