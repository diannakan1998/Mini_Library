################################################################################
# Automatically-generated file. Do not edit!
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
C_SRCS += \
../GraphicsFunctions.c \
../bluetooth.c \
../bt.c \
../gps.c \
../helper.c \
../main.c \
../screens.c \
../touchscreen.c \
../wifi.c 

C_DEPS += \
./GraphicsFunctions.d \
./bluetooth.d \
./bt.d \
./gps.d \
./helper.d \
./main.d \
./screens.d \
./touchscreen.d \
./wifi.d 

OBJS += \
./GraphicsFunctions.o \
./bluetooth.o \
./bt.o \
./gps.o \
./helper.o \
./main.o \
./screens.o \
./touchscreen.o \
./wifi.o 


# Each subdirectory must supply rules for building sources it contributes
%.o: ../%.c
	@echo 'Building file: $<'
	@echo 'Invoking: Arm C Compiler 5'
	armcc -I"C:\Users\Xueqi Zeng\Documents\DS-5 Workspace\cpen391" --c99 -O0 -g --md --depend_format=unix_escaped --no_depend_system_headers -c -o "$@" "$<"
	@echo 'Finished building: $<'
	@echo ' '


