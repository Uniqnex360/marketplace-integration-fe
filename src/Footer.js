import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear(); // Get current year dynamically

  return (
    <footer className="footer">
      <p>© {currentYear} K M Digi Commerce Private Limited. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
