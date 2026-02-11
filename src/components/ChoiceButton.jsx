export default function ChoiceButton({ children, onClick }) {
  return (
    <button className="choiceBtn" onClick={onClick}>
      {children}
    </button>
  );
}
