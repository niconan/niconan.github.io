# FreeBSD + Common Desktop Environment (CDE) installation notes
---

_Based on FreeBSD 11.1_

## Post-base system installation steps

All these commands should be run as root.

These steps are cherry-picked from [Allison Reid's excellent FreeBSD guide](https://cooltrainer.org/a-freebsd-desktop-howto/), Stackoverflow, and the FreeBSD forums.

**These notes are my personal preference for a desktop configuration.** If you want to discover more configuration options or read about more complex topics like firewall configuration, refer to the [Further reading](#further-reading) section.

### Updates and X

1. Run `freebsd-update fetch` followed by `freebsd-update install`.
2. If using an nVidia graphics card, follow the steps in the nVidia section.
3. `pkg install xorg` to install Xorg. If asked if you want to enable packages, say yes.
4. Reboot.

### Setting system locale to UTF-8

1. Edit `/etc/rc.conf`. One configuration block ends in `\:umask=022:`. Change that line and add a couple underneath it:

	```
	\:umask=022:\
	\:charset=UTF-8:\
	\:lang=en_US.UTF-8:
	```
2. Edit `/etc/profile` and add:

	```
	LANG=en_US.UTF-8;
	CHARSET=UTF-8;
	```
	
	This will set the `LANG` and `CHARSET` environment variables system-wide. These can be overridden in user-specific `profile`s.
	
### Configuration tuning for desktop use

FreeBSD is still primarily used as a server operating system. There are some settings we can tweak for better performance given the desktop use-case.

Edit `/etc/sysctl.conf` and add:

```
# Increase shared memory limits for xorg
kern.ipc.shmmax=67108864
kern.ipc.shmall=32768

# Make UI more responsive under high CPU load
# https://www.mail-archive.com/freebsd-stable@freebsd.org/msg112118.html
kern.sched.preempt_thresh=224
```

Edit `/boot/loader.conf` and add:

```
# Shared memory, max process increases
kern.ipc.shmseg=1024
kern.ipc.shmmni=1024
kern.maxproc=100000

# Support filesystems in user space
fuse_load="YES"

# Thermal sensors for Intel chips
# Change to amdtemp_load="YES" for amd chips
coretemp_load="YES"

# Enable temporary filesystems
# Required by certain applications, but can leave
# disabled until explicitly needed
tmpfs_load="YES"

# Asynchronous I/O
aio_load="YES"
```

Reboot.

## nVidia driver configuration

1. `pkg install x11/nvidia-driver` to install the latest driver. Depending on what card you're using, you may need the `x11/nvidia-driver-340` or `x11/nvidia-driver-304` instead. Check [this page](http://www.nvidia.com/Download/index.aspx?lang=en-us) to determine which driver is for your card.
2. If you installed driver version `358.009` or newer, run `sysrc kld_list+="nvidia-modeset"` or add `kld_list="nvidia-modeset` to `/etc/rc.conf` manually. Otherwise, set `kld_list="nvidia"`.
3. Reboot.
4. `mkdir -p /usr/local/etc/X11/xorg.conf.d` to create the `xorg.conf.d` directory.
5. Create `/usr/local/etc/X11/xorg.conf.d/driver-nvidia.conf` with the following contents:

	```
	Section "Device"
		Identifier "NVIDIA Card"
		VendorName "NVIDIA Corporation"
		Driver "nvidia"
	EndSection
	```
6. Reboot.

## The Common Desktop Environment

SCREENSHOT

### Why CDE?

I very much like the aesthetic consistency provided by CDE. The included toolchain makes it feel very complete and professional - there is a specific, consistent way of doing things. For example, the method of adding application launchers is the same every time and done through a tool provided with the environment.

CDE imposes an intended way of doing things and interacting with the desktop on the user. This is in very stark contrast to how the majority of other desktop environments on open-source operating systems work. They allow for a great deal of customizability - even GNOME3 allows for a decent amount through the installation of [GNOME Shell Extensions](https://extensions.gnome.org).

My personal preference tends toward sacrificing customizability at the cost of consistency and ease-of-use. CDE's enterprise UNIX background has led it to feeling very stable and comfortable to use and is now back in active development.

Admittedly, I've heard horror stories of folks who had to work with it in the 90s. Maybe I've just yet to see its flaws.

### Pre-installation

We need to set a fully-qualified domain name for the system. **Failing to do this properly will prevent CDE from launching!**

1. Check the current hostname with `hostname -f`. It will return something like `lain.my.domain`.
2. Edit `/etc/rc.conf` and look for `hostname=lain.my.domain`. It should already be set here. If it is not, set it, making sure it matches the output of `hostname -f`.
3. Edit the line of `/etc/hosts` beginning with `127.0.01` to look like:

	```
	127.0.0.1   lain.my.domain lain localhost localhost.localdomain
	```
	
	Note that regardless of your hostname, the `localhost localhost.localdomain` will always be the same.
	
Next we need to install some required packages - use `pkg install` for these:

* `xorg` - should have been installed in previous steps
* `git`
* `iconv`
* `bdftopcf` (may be installed already)
* `libXp` (may be installed already)
* `libXScrnSaver` (may be installed already)
* `ksh93`
* `open-motif`

Edit `/etc/rc.conf` and add the lines:

```
rpcbind_enable="YES"
inetd_enable="YES"
```

Reboot for good measure.

### Installation

1. `git clone git://git.code.sf.net/p/cdesktopenv/code cdesktopenv-code` to get the source code. At time of writing the latest release is `2.2.4`, but the git head has some key fixes in it, including one that makes the CDE login manager work.
2. `cd cdesktopenv-code/cde`
3. `mkdir -p imports/x11/include`
4. `ln -s /usr/local/include/X11 imports/x11/include`
5. `ln -s /usr/local/include/Xm imports/x11/include`
6. `ln -s /usr/local/include/fontconfig imports/x11/include`
7. `ln -s /usr/local/include/freetype2 imports/x11/include`
8. `make World` and pray.
9. `cd cdesktopenv-code/cde/admin/IntegTools/dbTools`
10. `./installCDE -s ../../../../cde`

We can enable ToolTalk, CDE's inter-process messaging service, pretty easily. I believe ToolTalk is required for certain CDE applications, so we might as well enable it:

1. `mkdir -p /etc/tt`
2. `cp cdesktopenv-code/cde/programs/tttypes/types.xdr /etc/tt`

Finally, create `/etc/rc.local` with the content:

```
/usr/dt/bin/dtlogin
```

Reboot and we should be presented with the CDE login screen.

### Post-installation

CDE by default does not use `~/.profile` or `/etc/login.conf` - instead it uses `~/.dtprofile`. At the bottom of this file is the line:

`# DTSOURCEPROFILE=true`

I've had no issues leaving this uncommented which then makes CDE source `~/.profile`. This solves the issue of certain FreeBSD binaries not being found, such as `pkg`.

## Miscellaneous

### Converting icons

CDE uses the `.pm` file format for bitmap graphics. An easy way to convert existing icons for applications from other formats is to use ImageMagick's `convert` command.

`$ convert file.png icon.xpm`

`$ convert icon.xpm -resize 48x48 icon.pm`

We can do the same for 32x32 and 16x16 sized icons.

## Further reading

The aforementioned [Allison Reid's excellent FreeBSD guide](https://cooltrainer.org/a-freebsd-desktop-howto/). It contains additional configuration steps specific to laptops.

FreeBSD uses OpenBSD's `pf` firewall. It is incredibly powerful and not too complex but is beyond the scope of these notes. See [OpenBSD's documentation](https://www.openbsd.org/faq/pf/) on `pf`, or [a book on the subject](https://www.nostarch.com/pf3).

The `tuning` [manpage](http://nixdoc.net/man-pages/FreeBSD/tuning.7.html) on FreeBSD.

The [SystemTuning wiki page](https://wiki.freebsd.org/SystemTuning). It is "initially just the current tuning(7) manpage with some annotations" but does have some additional info and explanations.