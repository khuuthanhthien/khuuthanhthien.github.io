+++
title = 'Conversion to Linux, from Windows'
summary = 'I like Windows, but I love Linux.'
date = 2024-07-03T15:31:21+07:00
draft = false
cover = {"image" = "windows2linux/arch-chan.png"}
tags = ["tech","linux"]
+++
## I used Windows,

and was not feeling like on the same boat with Microsoft with how they are directing the development of Windows Operating System, especially after hearing about that incoming [*Recall*](https://www.theverge.com/2024/6/13/24178144/microsoft-windows-ai-recall-feature-delay) feature. If it's being a normal user, I wouldn't care much about the announcement. However, it bothers me as a tech enthusiast that these people spend billions of dollars creating something that is advertised as an "improvement to quality of life" while fetching all of your personal data in the background, and sending those data to Microsoft. In that way they can use the collected data to "study" users behaviour and come up with more similar things, and they can also sell the data to third party companies, yeah, such angels.

There are many more reasons to why Windows is slowly being deprived the self-proclaim title "best operating system":
- The tradition of creating more unknown bugs after releasing an update tempting to fix the previously known bugs.
- Inferiority of the file system when Linux's file system (such as ext4) can access and read the content of Windows' NTFS (New Technology File System), but not vice versa.
- Absurb amount of resource consumption, even when idle.
- Limited system control and customizability.
- Microsoft Edge and the way they stubbornly integrate it into Windows.
- The collection of data without user's consent.

On the matter, I decided to make the big switch, Arch Linux is my choice.

---

## Why Arch, btw?
No I didn't use [`archinstall`](https://wiki.archlinux.org/title/archinstall), where's the fun in that?
I did everything manually and had everything under full control, just like how things should be. From connecting to wifi, partitioning the hard drive (broke my windows file system so bad that I had to reinstall everything), and installing packages. Had a nightmare of a week trying to figure out what was wrong with the graphics driver, since the machine runs hybrid graphics combo of intel + nvidia. And since nvidia hates Linux, it made my external monitor, which is set to run at 60Hz, to render everything at 30fps. Not untill I tried switching to use Display Port that I figured out  the real culprit is the HDMI port could not cope with nvidia drivers.

All of the mentioned above seems like a deal breaker for anyone who just simply needs a stable operating system. But we never know how capable we are, until we break our own limits. I shall make a post in the near future guiding on installing Arch Linux - one of the horsemen of complexity when it comes to Linux.
### Customizability
We can literally customize EVERYTHING to our heart's desire, from lockscreen to status bar, application appearance and...everything else.

![rice](/windows2linux/rice1.png)

*See [my dotfiles](https://github.com/tiam4tt/dotfiles.git) (WIP) for full configurations.*

Not just the look, we can optimizing Linux in a way that its RAM and CPU consumption can put Windows to shame, while maintaining the same performance.
### Full system control
With Linux , we get a full grasp of everything there is in the system, including drivers and kernel. Linux, with capabilities, allows you to grant specific powerful actions to programs even without full admin rights. This enhances security as programs only have the minimum privileges needed to function, unlike Windows where an admin program might have unrestricted access. It's like giving out specialized tools instead of a whole toolbox for each job.
### Bleeding edge updates
Arch Linux and its derivatives receive updates sooner than many of other Linux distros. This is called a **rolling realease model**. Unlike Ubuntu or Fedora which uses **fixed release**, you don't have to wait for a major version upgrade. This can sometimes break the system as constant updates are delivered to your system without a thorough test run, however such event happens can give you an opportunity to learn more about the operating system.
### Arch User Repository (AUR)
This is one of the biggest assets of Arch. Known for its huge user community, Arch has a repository of community-driven (anyone can contribute their work to the repository) packages with bleeding edge access (first in every update). With AUR Helpers such as `yay` or `paru`, installing everything is just a single command line away.

---

## Linux as daily driver
Have to admit, I miss Windows after a long time of using and getting comfy with the OS. But exploring new things in Linux is not that bad of an experience either. Arch Linux, without proper configurations can sometimes be a nuisance due to all the missing features that I got so attached to when using Windows. However, you have to stop and think for a moment: "is it really that important?", "can I live without it?", only to figure out many of the things you were so fond of turned out to be rather trivial.

Indeed the variety of applications is not as much as that of Windows', but the universe is expanding, so is Linux's collection of applications.
