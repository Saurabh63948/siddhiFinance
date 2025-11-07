import React from "react";
import AddPersonForm from "../AddPersonForm";

const AddPersonPage = ({ onAddPerson }) => {
  return (
    <div className="container pt-5">
      <h2 className="text-center mb-4 text-primary fw-bold">Add New Customer</h2>
      <AddPersonForm onAddPerson={onAddPerson} />
    </div>
  );
};

export default AddPersonPage;
