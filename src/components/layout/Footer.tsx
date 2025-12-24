import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="font-display text-sm font-bold text-primary-foreground">M</span>
              </div>
              <span className="font-display text-lg font-bold">Marketplace</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Buy and sell anything, anywhere in Sri Lanka.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Popular Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/category/Vehicles" className="hover:text-foreground transition-colors">Vehicles</Link></li>
              <li><Link to="/category/Property" className="hover:text-foreground transition-colors">Property</Link></li>
              <li><Link to="/category/Electronics" className="hover:text-foreground transition-colors">Electronics</Link></li>
              <li><Link to="/category/Fashion & Beauty" className="hover:text-foreground transition-colors">Fashion</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Help & Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Safety Tips</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-foreground transition-colors">Terms of Use</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
