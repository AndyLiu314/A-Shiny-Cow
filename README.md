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




