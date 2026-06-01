export function PageError({ errors }) {
  if (!errors.length) return null;

  return (
    <section className="error-box page-error">
      {errors.map((error) => <p key={error}>{error}</p>)}
    </section>
  );
}
