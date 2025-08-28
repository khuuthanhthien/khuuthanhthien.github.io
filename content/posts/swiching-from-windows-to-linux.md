+++
title = 'Switching from Windows to Linux'
description = "A personal take on moving from Windows to Linux, the hurdles I faced, and why I stuck with it."
date = 2024-07-03T15:31:21+07:00
draft = false
tags = ["tech","linux"]
+++

![cover](/windows2linux/arch-chan.png)

## I used Windows,

and was not feeling like on the same boat with Microsoft with how they are directing the development of Windows Operating System, especially after hearing about that incoming [*Recall*](https://www.theverge.com/2024/6/13/24178144/microsoft-windows-ai-recall-feature-delay) feature. If it's being a casual user, I wouldn't care much about the announcement. However, it bothers me as a tech enthusiast that these people spend billions of dollars creating something that is advertised as an "improvement to quality of life" while fetching all of your personal data in the background, and sending those data to Microsoft. In that way they can use the collected data to "study" users behaviour and come up with more similar things, and they can also sell the data to third party companies, yeah, such angels.

There are many more reasons to why Windows is slowly being deprived the self-proclaim title "best operating system":
- The tradition of creating more unknown bugs after releasing an update tempting to fix the previously known bugs.
- Inferiority of the file system when Linux's file system (such as ext4) can access and read the content of Windows' NTFS (New Technology File System), but not vice versa.
- Absurb amount of resource consumption, even when idle.
- Limited system control and customizability.
- Microsoft Edge and the way they stubbornly integrate it into Windows.
- The collection of data without user's consent.

On the matter, I decided to make the big switch, Arch Linux is my choice.

---

## Why Arch?
I chose not to use [`archinstall`](https://wiki.archlinux.org/title/archinstall) because I wanted to set up everything manually and have full control over the system. This included connecting to Wi-Fi, partitioning the hard drive, and installing packages. Along the way, I ran into some challenges, for example, configuring the graphics drivers for a hybrid Intel + NVIDIA setup. At first, my external monitor wasn’t running at the correct refresh rate, but switching from HDMI to DisplayPort solved the issue.

While this process can be daunting for anyone seeking a fully stable system right away, it’s been a valuable learning experience. I plan to write a detailed guide on installing Arch Linux in the future for those interested in exploring a highly customizable Linux environment.
### Customizability
We can literally customize EVERYTHING to our heart's desire, from lockscreen to status bar, application appearance and...alomst everything else.

![rice](/windows2linux/rice1.png)

*I have the [dotfiles](https://github.com/tiam4tt/dotfiles.git) for these shared on Github.*

Not just the look, we can optimizing Linux in a way that its RAM and CPU consumption can put Windows to shame, while maintaining the same performance, or even better.

### Full system control
With Linux , we get a full grasp of everything there is in the system, including drivers and kernel. Linux, with capabilities, allows you to grant specific powerful actions to programs even without full admin rights. This enhances security as programs only have the minimum privileges needed to function, unlike Windows where an admin program might have unrestricted access. It's like giving out specialized tools instead of a whole toolbox for each job.

### Bleeding edge updates
Arch Linux and its derivatives receive updates sooner than many of other Linux distros. This is called a **rolling realease model**. Unlike Ubuntu or Fedora which uses **fixed release**, you don't have to wait for a major version upgrade. This can sometimes break the system as constant updates are delivered to your system without a thorough test run, however such event happens can give you an opportunity to learn more about the operating system.

### Arch User Repository (AUR)
This is one of the biggest assets of Arch. Known for its huge user community, Arch has a repository of community-driven (anyone can contribute their work to the repository) packages with bleeding edge access (first in every update). With AUR Helpers such as `yay` or `paru`, installing everything is just a single command line away.

---

## Linux as daily driver
After using Linux for a while, I sometimes miss certain features from Windows. That said, exploring Linux has been a rewarding experience. Arch Linux, in particular, requires some setup to match the convenience of other operating systems, but it’s also an opportunity to understand and configure your system the way you want.

While the variety of applications isn’t always as extensive as Windows, Linux’s ecosystem continues to grow steadily, offering more tools and options over time.
