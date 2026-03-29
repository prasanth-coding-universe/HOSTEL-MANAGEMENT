function PageHeader({ title, description }) {
  return (
    <div className="section-heading">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default PageHeader;
