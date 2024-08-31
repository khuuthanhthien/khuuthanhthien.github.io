+++
title = 'Arch Install: a comprehensive guide'
date = 2024-07-08T10:23:41+07:00
draft = false
cover = {"image" = "arch_install_guide/arch_wallpaper.jpg"}
tags = ["tech","linux"]
+++
## Yet another guide to installing Arch Linux

> ⚠️ **Disclaimer:** I am not responsible for the lost of data, faulty BIOS, thermonuclear war, or you only seeing your face in the screen because everything goes blank after installing graphics drivers. This is an installation guide, simplified based on my personal experience, with the only purpose is to be more approachable.

> Please refer to the official [installation guide](https://wiki.archlinux.org/title/installation_guide) from Arch wiki if you encounter something different that is not mentioned in this post.
---
## Prerequisites
- **BACKUP ALL OF YOUR DATA**
- A USB with at least 8GB of storage.
- A working computer and stable internet connection.
---
## Preparation
### Disable secure boot

Secure Boot is a security feature that restricts your system to booting with software signed by your device's manufacturer. This helps prevent malicious software from loading during startup. However, it can potentially prevents unsigned operating systems, like some Linux distros, from booting up.

By disabling Secure Boot, we enable a wider range of compatibility. Although Arch Linux is a signed distro, meaning we can potentially keep Secure Boot enabled, some of its kernel variants and other necessary packages (even proprietary ones) might not guarantee such security.

1. Enter BIOS menu:
- You can access this menu by pressing a key while your system is booting, such as F1, F2, F12 or Esc depending on your motherboard's manufacturer.
2. Find the **Secure boot** option in your BIOS setting menu and set it to **disabled**. You can find this option in either the **Security** tab or the **Boot** tab.
3. Save changes and exit.

### Create a bootable USB
- **Obtain an ISO image** from the official [download](https://archlinux.org/download/) page, scroll down to the bottom and select a server to download. You should pick the nearest server to your geographical location for optimized download speed.
- **Choose a USB formatting tool**, some of the popular ones are [Balena Etcher](https://etcher.balena.io/) (Windows/MacOS/Linux), [Rufus](https://rufus.ie) (Windows), [Ventoy](https://www.ventoy.net/en/download.html) (Windows/Linux).
- Follow the tool's instruction and flash the .iso file to your USB.

### Boot into the live USB
- Boot into BIOS menu and navigate to **boot menu**. Select the option to boot with your USB.
- On successful boot, you will be greeted with the following screen:

![first_boot](/arch_install_guide/first_boot.png)

### Partition the disks
When recognized by the live sytem, disks are assigned to a *block device* such as `/dev/sda` or `/dev/nvme0n1/`.
To identify your disks, use **lsblk**
```
lsblk
```
Results ending in **rom**, **loop** or **airootfs** can be ignored.

To partition your selected disk, it is recommended to use **cfdisk**, which is similar to **fdisk** but with a less complicated interface.
```
cfdisk /dev/your_disk_name
```
You should see a similar screen as follow, with `sda` being your disk name (e.g.`nvme0n1`):
![cfdisk1](/arch_install_guide/cfdisk1.png)


From here, take your time planning a proper long-term partitioning layout to avoid complicated resizing procedures in the future.

#### Recommended layout:
| **Mount point**   | **Partition type**     | **Suggested size**                       |
| :---------------- | :--------------------- | :--------------------------------------- |
| `/boot`           | EFI partition          | 1GB                                      |
| `[SWAP]`          | Swap partition         | At least 4GB                             |
| `/`               | Root partition         | Remainder of storage (at least 23-32GB)  |

> If the disk from which you want to partition already has an **EFI system partition**, do not create another and use the existing one instead. If you're dual booting and your Windows system is present in the disk, there should be an EFI partion which can be shared with Arch.

> **Swap** virtual memory partition is optional.

After creating new partitions, save the changes by choosing **[write]**.

- When you're done partitioning, use `lsblk` again to make sure the layout is correct.

### Format the partitions

**Root partition (ext4)**
```
mkfs.ext4 /dev/your_root_partition
```
**Swap partition (swap)**

No need to perform this if you didn't create a **[SWAP]** partition in the previous step.
```
mkswap /dev/your_swap_partition
```
**EFI partition (fat32)**
> ⚠️ If you did not create the EFI system partition during the partitioning step. **DO NOT** reformat the previously existing EFI partition, it can destroy the bootloader of other installed operating systems.
```
mkfs.fat -F 32 /dev/your_efi_partition
```
### Mount the partitions
**Mount the root volume**
```
mount /dev/your_root_partition /mnt
```

**Mount the EFI system partition**
Create a mounting point under `/mnt` for EFI beforehand with `mkdir`:
```
mkdir -p /mnt/boot/efi
```
Then mount the efi partition:
```
mount /dev/your_efi_partition /mnt/boot/efi
```
Afternatively, you can run `mount` with `--mkdir` option:
```
mount --mkdir /dev/your_efi_partition /mnt/boot/efi
```
**Enable swap partition**

If you had [SWAP] created, simply enable it:
```
swapon /dev/your_swap_partition
```
---
## Installation
### Connect to the internet
This step requires internet connection. To connect to a wireless network, we will use the pre-installed `iwd` ultility:
```
iwctl
```
Next, list all your wireless interfaces/devices using this command:
```
device list
```
Select the preferred one, normally `wlan0`.

Now scan for available networks:
```
station wlan0 scan
```
(replace `wlan0` with your preferred one)

While it's scanning, see available connections with this command:
```
station wlan0 get-networks
```
Connect to your target Wi-Fi:
```
station wlan0 connect "name of network/wifi"
```
*If it's password-protected, you will be asked for a password, enter its credentials and you should be good to go.*

Exit the tool by pressing **Ctrl + D**. Or type `exit` in the console.

We can check the connection with `ping`:
```
ping google.com
```
If you get bytes in reply, the you are connected. Press **Ctrl + C** to cancel the ping process.

### Select the appropriate mirror
It is recommended to select the optimal mirror list for your Arch Linux to ensure the fastest server response when installing or upgrading packages.
The top mirror located in `/etc/pacman.d/mirrorlist` is chosen automatically and might not actually be the best one.
To prevent this problem. First we need to sync the pacman repository:
```
pacman -Syy
```
Now install `reflector`, a Python script that retrieves the latest mirror from [Arch mirror status](https://archlinux.org/mirrors/status/), filter the most up-to-date mirrors and sort them by speed.

```
pacman -S reflector
```
Make a backup of mirror list:
```
cp /etc/pacman.d/mirrorlist /etc/pacman.d/mirrorlist.bak
```
Find your country's in the mirror list with reflector:
```
reflector --list-countries
```
Remember your country code in `Code` column.

Now, get the good mirror list with reflector and save it to `/etc/pacman.d/mirrorlist`:

```
reflector --sort rate -c "country_code" -f 10 -l 10 -n 10 --save /etc/pacman.d/mirrorlist
```
- `--sort rate`: sorts the mirror list by download rate, descending.

- `-c`: specifies which country to fetch mirror list from.

- `-f 10`: tells the script to fetch the fastest 10 mirrors.

- `-l 10`: tells the script to fetch the latest 10 mirrors.

- `-n 10`: tells the script to fetch the max amount of 10 mirrors.

You can customize the number after each filter options to your liking. Type `reflector -h` in the console for a full list of options.

### Install fundamental packages
Now that we have obtained a good mirror list, we can proceed to install the most basic packages for Arch Linux:
```
pacstrap /mnt base linux linux-firmware grub efibootmgr neovim
```

`base`, `linux`, `linux-firmware`: these 3 packages provide the most standard experience and is required for a functional Arch Linux system. With `linux` and `linux-firmware` being the kernel for Linux. Alternatively they can be substituted for other variants of Linux kernel such as `linux-lts`, `linux-zen`. Make sure you install the firmware that goes with the kernel (`linux-lts-firmware`, `linux-zen-firmware`, etc.).

- `grub`: the chosen bootloader for Linux system and is one of the most preferred ones.

- `efibootmgr`: is used to modify the EFI Boot Manager. It can create and destroy boot entries, change the boot order, change the next running boot option, and more.

- `neovim`: the standard text editor. Requires a basic knowledge of Vim.

*Additionally you can add more packages to support the setup process, or install them later with `pacman`.*

The installation process should take 10-15 minutes. If it fails during the time, you can run the install command again.

---

## Configure the system
Now that we have basically finished installing Arch Linux. These are the few steps left that prevent us from being an Arch user.
### Fstab
Generate file system table with this command:
```
genfstab -U /mnt >> /mnt/etc/fstab
```
The content in `/mnt/etc/fstab` should be identical to the output when we run this command in console:
```
genfstab -U /mnt
```
Check `/mnt/etc/fstab` and edit/regenerate in case of errors by using `cat` to print the file's content into console:
```
cat /mtn/etc/fstab
```

### Change root directory into the new system
```
arch-chroot /mnt
```
This command let us enter the mounted disk as *root*. Now you are using the newly installed Arch Linux system. Further configurations is needed so you could run it properly when reboot.
### Timezone
By default Arch's timezone if set to UTC. We can use **timedatectl** to change the correct timezone.
```
timedatectl list-timezones
```
The above command lists all of the available timezones. Choose your timezone and apply it with this command:
```
timedatectl set-timezone Vietnam/Ho_Chi_Minh
```
Replace `Vietnam/Ho_Chi_Minh` with the timezone that you prefer.

### Localization
This is what determine the language, numbering, date, and currency formats of our system.

`/etc/locale.gen` contains all the available locales that we can choose by uncomment the lines.

```
nvim /etc/locale.gen
```
- Enter **edit mode** by pressing *i* then navigate to the desired line of your locale and remove `#` at the beginning.
- Press **Esc** to enter **normal mode** and type `:wq` to save the changes and quit to console.
*I would recommend having en_US.UTF-8 as system language to make it easier diagnosing problems and finding solutions, you can choose an addition of your native language for other format like date, time and currency.*

- Create **locale.conf** and set the language accordingly:
```
nvim /etc/locale.conf
```
Add this line to the file and save it (you can replace *en_US.UTF-8* with your preferred system language):
```
LANG=en_US.UTF-8
```
Finally generate the locale configurations:
```
locale-gen
```
You should see the chosen locales being generated.

### Network configuration
Create a `/etc/hostname` file to add your computer's hostname to the network
```
echo archuser > /etc/hostname
```
Replace **archuser** with your preferred hostname.

Next is to create the hosts file:
```
nvim /etc/hosts
```
Add this configuration to your **hosts** file (replace **archuser** with your hostname as well):
```
127.0.0.1	localhost
::1		localhost
127.0.1.1	archuser
```
### Setup root password
Run the following command and set the password for your *root* account:
```
passwd
```
Additionally, it is strongly recommended avoid using the system as root. Best practice is to add another user and grant root access.
```
useradd -m newuser
passwd newuser
```
Replace `newuser` with your preferred name and choose a password.

Now grant our new user root access and other privileges:
```
usermod -aG wheel,audio,video,storage newuser
```
The above command adds **newuser** to 4 groups: *wheel*, *audio*, *video* and *storage* which accordingly allowing access to super user, audio devices, video devices and storage devices control.

Finally, we need to edit the visudo file so that root access can be granted to **wheel** user group:
```
EDITOR=nvim visudo
```
![visudo](/arch_install_guide/visudo.png)

Uncomment `%wheel ALL=(ALL:ALL) ALL` to grant root access to your newly created user.

**Unmount all partitions and reboot the system:**
```
umount -a && reboot
```
Login with your created username and password.

Now, unless you're a masochist, you wouldn't want your Linux system to be a simple terminal with text. It's time to install a **graphical interface** and other utilities to make Arch Linux more usable.

## Install graphical interface

### Behind the screen

Linux, on its own, is a functional operating system without the need of an UI. We can interact with the system via command line interface (CLI). However, having a graphical interface installed will make things much more intuitive and task efficient.

There are many ways to render visual elements on your screen. Here's a general walkthrough:

1. **X Window System** (or **X** for short), is a display protocol that defines how applications talk to display, developed in 1984 and is latest at version 11 (X11). It uses a client-server model where applications (clients) send request to a central program (server) to draw things on the screen. In X, server-client is the relationship between application and the X display server itself.

2. **X.Org (Xorg)** is a free and open source implementation of the X11 display protocol.

3. **Wayland** is a newer display protocol designed to be the successor of X11. It aims for a simpler and more secure architecture by having applications communicates directly with a compositor instead of a separate server.

4. **Window manager** acts as a separate program from X server. It manages how application are arranged on the screen, this include:
    - Positioning (location of that window on the screen).
    - Sizing (dimension of window).
    - Decoration (title bars, borders,...).
    - Behaviour (moving, resizing, minimizing/maximizing,...).
May provide additional features like snapping and tiling.
5. **Compositor** handles the actual rendering of windows on the screen, including:
    - Receiving windows components from applications (buffers).
    - Combining (compositing) these buffers into a final image for the display.
    - Enabling visual effects like transparency, shadows and animations.

In **X11**, compositor can be a separate program from the **window manager**, but often **window managers** include compositing functionality.

In **Wayland**, the compositor takes on both window management and compositing tasks, acting as a single program.

6. **Desktop environment (DE)** is essentially the graphical interface that you interact with on top of the core Linux system. It can ultilize the use of both Wayland and X11 display protocol for display and comes packed with more features for controlling your system overall.
- There are many DEs to choose, each with their own set of core applications and features. Normally people will choose one of the followings:
    - **xfce:** a minimal, light-weight DE with efficient resource consumption, suitable for old hardwares.
    - **GNOME:** modern and user-friendly DE, has sleek interface and supports many extensions for customization.
    - **KDE Plasma:** Feature-rich and highly customizable, the design language is generally not as catchy as **GNOME** but its collection of features and proprietary applications definitely balances the scale.
    - **Cinnamon:** Has a familiar layout to that of Windows, holds a good balance of features and performance.

- In this guide, we will install **KDE Plasma** for graphical interface.

Of course there are many other methods of displaying things in your screen to choose as wished such as [i3 - tiling window manager](https://i3wm.org/), [hyprland - tiling wayland compositor](https://hyprland.org/) and many more.

### Install KDE Plasme Desktop Environment
- Start by performing a full system update so that all package informations are up-to-date:
```
sudo pacman -Syu
```
- Now install KDE Plasma
```
sudo pacman -S plasma
```
It will prompt you to choose which applications to install, don't choose anything and press **Enter** to install all.

`plasma` is a group of KDE's core applications neccessary for a functional Desktop Environment, shipped with bluetooth and network control utilities, file manager, system settings, etc.

Additionally, you can install the full collection of KDE's applications with `kde-applications` (please note that this package will contain many applications that you don't need, or might need, including games and potentially bloatwares):
```
sudo pacman -S kde-applications
```

## AUR Helper
You're missing out on a lot things if your Arch Linux doesn't have an [AUR Helper](https://wiki.archlinux.org/title/AUR_helpers) - a tool that simplifies interacting with the AUR. Manually downloading, building, and installing AUR packages can be cumbersome. AUR Helpers automate these tasks, making it easier and faster to install software from the AUR.

**yay** will be the chosen one for this guide.

```
pacman -S --needed git base-devel
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si
```

The user guide for **yay** can be found in [this repository](https://github.com/Jguer/yay)

## Enable core sevices
Before you reboot into the new system. Enable `sddm` that `KDE plasma` uses as the default display manager (login screen).
```
sudo systemctl enable sddm.service
```
Also enable `NetworkManager.service` to be able to configure network connections on next reboot:
```
sudo systemctl enable NetworkManager.service
```
Reboot and enjoy your new Linux system:
```
reboot
```
## Install additional packages
If your computer has a dedicated graphics card (NVIDIA/AMD) then you should consider installing the respective drivers to make use of everything from your computer. Refer to the Arch Wiki for installation guide with [AMD gpu](https://wiki.archlinux.org/title/AMDGPU) or [NVIDIA gpu](https://wiki.archlinux.org/title/NVIDIA).

## Welcome to the dark side, or the bright side, depends on how you put it.
You did it! Welcome to the Arch realm! Taming the Arch installation process is no small feat, and you should be proud of conquering the command line and configuring your system. Now you have a powerful, customizable Arch Linux installation ready to be molded into your perfect desktop. The journey of exploration with Arch begins now!