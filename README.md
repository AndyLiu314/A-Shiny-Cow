# SHADING COW
## Made By: Andy Liu

**Instructions To Run:** 
The program should work on the latest stable version of Chrome. However, if it does not run, 
try creating a localhost server and opening the HTML file through that. I ran my file by selecting "Start Server Logging" 
in the VSCode Command Palette and then copying the link provided into "Debug: Open Link" (also in the Command Palette).

**Overview of Design:** 
The implementation of this program follows the assignment guidelines with all control being the same. Left click and drag 
controls X and Y translation while the up and down arrow keys controls Z translation. Right click and drag controls the 
rotation around the X and Y axes while Z rotations are controlled by the left and right arrows. Pressing 'r' will reset 
the position of the cow and pressing 'p' stops the rotation of the point light. Since the instructions on the point light
were slightly vague, I was not sure if the point light was supposed to follow the cow or remain stationary. However, the
instructions said that the point light rotates "above the cow" so I attached the light to always be above the position
of the cow. 

**Uncompleted Steps:** 
Unfortunately, due to time constraints, I was not able to perfectly implement Phong reflection or Shading. However, I did 
my best to implement a Phong lighting model that uses per-fragment lighting. To help with my implementation, I used
examples from within the textbook and lectures to write and modify code for my vertex and fragment shaders. This is 
something that I would like to later return to and try to implement as I do find it very interesting. 

**Note** 
I also did not start the spotlight implementation


