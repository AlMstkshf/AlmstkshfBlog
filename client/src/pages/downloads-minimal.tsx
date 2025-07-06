import { useState, useEffect } from "react";

export default function Downloads() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/downloads')
      .then(res => res.json())
      .then(data => {
        setDownloads(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading downloads...</div>;
  }

  return (
    <div>
      <h1>Downloads</h1>
      {downloads.length > 0 ? (
        <div>
          {downloads.map((file: any) => (
            <div key={file.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <h3>{file.title}</h3>
              <p>{file.description}</p>
              <button onClick={() => window.open(`/api/downloads/${file.id}/file`, '_blank')}>
                Download
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No downloads available</p>
      )}
    </div>
  );
}