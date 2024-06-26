import SecurityCard from "./SecurityCard";

const SecurityCards = ({ metrics }) => {
  return (
    <div className="px-10 flex flex-row items-center justify-around mt-6">
      {Object.entries(metrics).map(([key, val]) => {
        return <SecurityCard header={key} data={val} />;
      })}
    </div>
  );
};

export default SecurityCards;
