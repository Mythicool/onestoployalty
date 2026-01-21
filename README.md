# One Stop Anime - Loyalty Pack Opening Experience 🎴

A premium, gamified loyalty program signup experience designed for One Stop Anime trading card shop.

## ✨ Features

### Interactive Pack Opening
- **Sealed Pack Animation**: Holographic shine effects and floating animation
- **Tear-to-Open Mechanic**: Click to tear open the pack with particle burst effects
- **Card Reveal**: Dramatic flip animation with rarity-appropriate visual effects

### Reward Tiers (TCG-Style Rarity System)
| Rarity | Probability | Reward |
|--------|-------------|--------|
| Common | 40% | 5% OFF |
| Uncommon | 30% | 10% OFF |
| Rare | 18% | 15% OFF |
| Ultra Rare | 10% | FREE BOOSTER PACK |
| Secret Rare | 2% | $50 STORE CREDIT |

### Visual Effects
- Particle background system
- Holographic card effects (Rare+)
- Rainbow border animation (Secret Rare)
- Confetti celebrations (Uncommon+)
- Screen flash on rare pulls
- Card tilt effect on mouse movement

### User Experience
- Mobile-responsive design
- Promo code copy functionality
- Social sharing integration
- Local storage persistence
- Dark anime-aesthetic theme matching One Stop Anime branding

## 🚀 Usage

1. Open `index.html` in a browser
2. Click "Join & Open Your Pack"
3. Fill out the signup form
4. Tap the sealed pack to tear it open
5. Click the card to reveal your reward
6. Copy your promo code and shop!

## 📁 File Structure

```
loyaltypacks/
├── index.html      # Main HTML structure
├── styles.css      # All styling and animations
├── script.js       # Interactive functionality
└── README.md       # This file
```

## 🎨 Customization

### Adjust Reward Probabilities
Edit the `REWARDS` object in `script.js`:
```javascript
const REWARDS = {
    common: {
        probability: 0.40,  // 40%
        reward: "5% OFF",
        // ...
    },
    // ...
};
```

### Modify Colors
Update CSS variables in `styles.css`:
```css
:root {
    --primary: #667eea;
    --secondary: #764ba2;
    --accent: #f093fb;
    /* Rarity colors */
    --common: #8b9dc3;
    --uncommon: #50c878;
    --rare: #4169e1;
    --ultra-rare: #ff6b6b;
}
```

## 🔗 Integration

To integrate with your website:

1. **Embed as iframe** or link directly
2. **Connect to backend**: Modify `saveUserData()` in script.js to POST to your API
3. **Validate codes**: Implement server-side promo code validation

## 📱 Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome for Android)

## 🌸 Credits

Designed for [One Stop Anime](https://onestopanime.netlify.app/)

---

*Your one-stop destination for anime collectibles, trading card games, manga, figures, and authentic Japanese imports.*
