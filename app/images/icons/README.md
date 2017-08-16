# Icons

## Design recommandations

Make sure you respect these points before exporting :

- 24*24 icons as they can be resized with CSS
- Merging as many shapes together as possible.
- Opaque black as much as possible

Finally, place your new icon inside the `app/images/icons` folder. From there, it will be optimized, merged with the others and included every time we build the app.

## Usage inside the app

### Inside CSS / Sass

Just reference the icon like you would normally do, for example:

```css
.my-element::before {
  background: url('/path/to/images/icons/my-icon.svg');
}
```

See the storybook we have to see more examples.

### Inside JS

We made a React component to easily use the icons available in the app.

```jsx
import Icon from '/path/to/scripts/components/shared/icon.components';

const ComponentWithIcon = () => (
  <Icon name="my-icon" />
);
```

If you need to use it outside this case (and we could use it in the future to load illustrations):

```jsx
import Icon from '/path/to/images/icons/my-icon.svg';

const MyComponent = () => (
  <div>
    {/* You can use it with an <img /> */}
    <img href={Icon.id} />

    {/* You can use it with an <svg /> */}
    <svg viewBox={Icon.viewBox}>
      <use xlinkHref="#twitter"></use>
    </svg>
  </div>
);
```
