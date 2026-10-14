**Dev log #2 · Two rooms, from references to Blender**

Two locations are standing now: Kessler's office, and the hallway of the Hale house.

How I build the spaces:

1. **References first.** I generate images of the room until the mood is right. They're the target, not the blueprint.
2. **A plan in metres.** I measure everything against the reference and fix the sizes: a 1.90 m desk, a hallway 2.5 m wide and 3 m high, sconces at 1.95 m. The plan decides where things go.
3. **Props one by one.** Each prop gets its own reference: one object, neutral light, real size. That's what the model is made from.
4. **Blender.** Every model scaled to the plan and brought to one look: one walnut for all the wood, stray details cleaned off.
5. **Match the camera.** I put the camera where the reference was "shot" and compare until the two line up.
6. **Bake the light.** Every lamp gets its own channel, so in the game each one can flicker or die on its own.
7. **Optimize.** Atlases, compressed textures, fewer triangles, fewer draw calls: the whole game has to load fast and hold 60 fps on a laptop.

**Some of my thoughts on this stage**

- A generated image is a mood board, not a floor plan. Measure first, then build.
- Match the camera early. Once the view lines up, every placement is easy to judge.
- Generating 3D models lets your imagination run wild. You get the thing exactly as you pictured it in your head. But more often than not, fixing a generated mesh takes as long as modelling it again from the reference.
- For generating models, one object per reference works far better than a busy scene.
- Give textures time, whether it's wood or wallpaper. They sell the era more than any model does. Free CC0 libraries worth knowing: Poly Haven, ambientCG, ShareTextures, cgbookcase.
- Optimization is an art of its own. Making it beautiful is half the job; making it beautiful at 60 fps in a browser is the other half.
- Small details carry the story: a child's drawing on the table, a label in the host's own handwriting.

Next: both rooms in the browser, with their baked light.
