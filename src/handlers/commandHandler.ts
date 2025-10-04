async handleStatus(message: any): Promise<CommandResult> {
    const startTime = Date.now();
    try {
        const me = await this.client.getMe();
        const uptime = process.uptime();
        const memory = process.memoryUsage();
        
        const statusMessage = `🤖 **Bot Status**\n\n` +
            `✅ **Online:** Yes\n` +
            `👤 **User:** ${me.firstName}\n` +
            `⏰ **Uptime:** ${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s\n` +
            `💾 **Memory:** ${Math.round(memory.heapUsed / 1024 / 1024)}MB\n` +
            `🛡️ **Security:** Enabled`;

        await message.reply({
            message: statusMessage,
            parseMode: 'html'
        });

        const executionTime = Date.now() - startTime;
        logger.info(`Status command executed in ${executionTime}ms`);

        return {
            success: true,
            message: 'Status information sent',
            executionTime,
            userId: message.senderId,
            chatId: message.chatId,
            data: { uptime, memory }
        };
    } catch (error) {
        const executionTime = Date.now() - startTime;
        logger.error('Status command failed:', error);

        return {
            success: false,
            error: 'Failed to fetch status information',
            executionTime,
            userId: message.senderId,
            chatId: message.chatId
        };
    }
}

async handleSpeed(message: any): Promise<CommandResult> {
    const startTime = Date.now();
    try {
        const tempMsg = await message.reply({
            message: '⚡ Testing speed...'
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        let performance = 'Excellent 🚀';
        if (responseTime > 1000) performance = 'Good 👍';
        if (responseTime > 3000) performance = 'Slow 🐢';
        
        const speedMessage = `**Speed Test Results**\n\n` +
            `**Response Time:** ${responseTime}ms\n` +
            `**Performance:** ${performance}\n` +
            `**Test Time:** ${new Date().toLocaleTimeString()}`;

        await this.client.editMessage(tempMsg.chatId, {
            message: tempMsg.id,
            text: speedMessage,
            parseMode: 'html'
        });
        
        logger.info(`Speed test completed in ${responseTime}ms - ${performance}`);

        return {
            success: true,
            message: 'Speed test completed',
            executionTime: responseTime,
            userId: message.senderId,
            chatId: message.chatId,
            data: { responseTime, performance }
        };
    } catch (error) {
        const executionTime = Date.now() - startTime;
        logger.error('Speed test failed:', error);
        return {
            success: false,
            error: 'Speed test failed',
            executionTime,
            userId: message.senderId,
            chatId: message.chatId
        };
    }
}
