function Save_Recording({ word }: { word: string[] }) {
    return (
        <div className="flex flex-col h-[80vh] bg-gray">
            {word.map((w, index) => (
                <p key={index}>{w}</p>
            ))}
        </div>
    );
}

export default Save_Recording;
