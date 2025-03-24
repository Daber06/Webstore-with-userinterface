const Footer = () => {
    return (
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} My Webstore. All rights reserved.</p>
        <p>Contact us: support@mywebstore.com</p>
        <p>Follow us on 
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"> Twitter</a>,
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"> Instagram</a>
        </p>
      </footer>
    );
  };

export default Footer;