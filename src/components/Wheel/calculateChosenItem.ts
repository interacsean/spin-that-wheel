// Returns the item from the `items` array which will be at the 0 point, given the 
// wheel has rotated `angle` radians
export function calculateChosenItem(items: string[], angle: number) {
  const angleRounded = angle % (Math.PI * 2);
  const angleAsFraction = 1 - (angleRounded / (Math.PI * 2));
  const i = Math.abs(Math.floor((angleAsFraction * items.length)));
  console.log({ angleRounded, angleAsFraction, i })
  return items[i];
}
